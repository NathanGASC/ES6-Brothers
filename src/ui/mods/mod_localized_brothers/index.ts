import 'core-js/actual/dom-collections/for-each';
import 'core-js/actual/array/virtual/find-index';

import fr from "./translations/fr.json"
import en from "./translations/en.json"
import { isAncestorOf } from "./utils/isAncestorOf"
import { escapeRegExp } from "./utils/escapeRegExp"
import {traverseChildren} from "./utils/traverseChildren"

class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";
  dictionary = { fr, en }
  private currentLang: keyof typeof this.dictionary = "en"
  
  constructor() {
    var mutationObserver = new MutationObserver((mutationList) => {
      const consoleElement = document.querySelector("#console")

      mutationList.forEach((mutation) => {
        //TODO: add more conditions to avoid using translateElement too much as the method is costly
        //debounce & throttle can help to handle the cost
        if(!(mutation.target instanceof HTMLElement)) return
        if (isAncestorOf(consoleElement as HTMLElement, mutation.target)) return;
        if ((mutation.target).textContent == null || (mutation.target).textContent == "") return;
        if(mutation.attributeName == `data-translated-to`) return
        if((mutation.target).dataset[`translatedTo`] == this.currentLang) return;
        mutation.target.dataset[`translatedTo`] = this.currentLang;

        this.translateElement(mutation.target, "en", this.currentLang)
      })
    })
    mutationObserver.observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;
  }

  /**
   * Short name for "setCurrentLang"
   * @param lang The new lang you want to use (ex:"fr", "en", "ja", ...)
   */
  setLang(lang: keyof typeof this.dictionary) {
    this.setCurrentLang(lang)
  }

  /**
   * Change the current lang to another one. If the lang don't exist, no change
   * will happen.
   * @param lang The new lang you want to use (ex:"fr", "en", "ja", ...)
   */
  setCurrentLang(lang: keyof typeof this.dictionary) {
    const oldLang = this.currentLang;
    this.currentLang = lang
    this.translateAllIn(document.body, oldLang, lang);
  }

  /**
   * get the current lang
   * @returns 
   */
  getCurrentlang() {
    return this.currentLang
  }

  /**
   * Get a translation using a key for the current lang
   * @param key the key of the wanted translation
   * @returns the tranlsation for the given key/current lang or undefined if not
   */
  getFromKey(key: keyof typeof en) {
    return this.getFromKeyForLang(key, this.currentLang)
  }

  /**
   * Get a translation using a key for a given lang
   * @param key the key of the wanted translation
   * @param lang the lang which should have this key
   * @returns the tranlsation for the given key/lang or undefined if not
   */
  getFromKeyForLang(key: keyof typeof en, lang: keyof typeof this.dictionary) {
    return this.dictionary[lang][key]
  }

  /**
   * Get a key from a value in the current lang.
   * @param value the value which need to be finded to return is key
   * @returns the key or udnefined if doesn't exist
   */
  getFromValue(value: string) {
    return this.getFromValueForLang(value, this.currentLang)
  }

  /**
   * Get a key from a value in the given lang.
   * @param value the value which need to be finded to return is key
   * @param lang the lang which should have this value
   * @returns the key or udnefined if doesn't exist
   */
  getFromValueForLang(value: string, lang: keyof typeof this.dictionary) {
    for (const key in this.dictionary[lang]) {
      var _value = this.dictionary[lang][key as keyof typeof en]

      //Build a regex which will accept everything as value between 2 "%".
      var builtRegex = "^" + (escapeRegExp(_value)).replace(/%(.*?)%/g,".*") + "$"
      var finalRegex = new RegExp(builtRegex, "gm")

      if (finalRegex.test(value)) return key
    }
  }

  /**
   * Translate an element from a specific lang to another. The innerHTML of this element will be searched in the translations
   * to get the translation key from the old language and translate it to another one.
   * @param element the element to translate
   * @param fromLang the old lang which should be the lang of the text in the given element
   * @param toLang the new lang which should replace the old one
   */
  translateElement(element: HTMLElement, fromLang: string, toLang: string) {
    const domText = element.innerHTML;
    const domTextFormated = this.reverseTranslationParser(domText);
    var translationKey = this.getFromValueForLang(domTextFormated, fromLang as any);

    if(!translationKey){
      //TODO: this comments are here to help debuging tooltips if needed
      // if(isAncestorOf(document.querySelector(".tooltip-module"),element)){
      //   console.log("domText : " + element.textContent)
      //   console.log("domTextFormated : " + domTextFormated)
      //   console.log(translationKey)
      // }

      translationKey = this.getFromValueForLang(element.textContent, fromLang as any);
      if(translationKey) this.translateAllIn(element, fromLang, toLang)
      return
    }


    var oldTranslation = this.getFromKeyForLang(translationKey as any,fromLang as any) as string
    oldTranslation = this.translationParser(oldTranslation)
    var data = this.dataExtractor(domText, oldTranslation)
    var newText = this.getFromKeyForLang(translationKey as any, toLang as any);
    newText = this.translationParser(newText)
    newText = this.dataInjector(newText, data);

    element.innerHTML = newText;
  }

  /**
   * Translate all element in the page. Don't call it too much as it resources conssuming
   * @param root the element containing every element you want to translate. Less this element have shild, less it will be resource consumming
   * @param fromLang translate from the this lang
   * @param toLang translte to this lang
   */
  translateAllIn(root: HTMLElement, fromLang: string, toLang: string) {
    root.querySelectorAll("*").forEach((elem) => {
      this.translateElement(elem as HTMLElement, fromLang, toLang)
    })
  }

  /**
   * Translate all element in the page. Don't call it too much as it resources conssuming
   * @param fromLang translate from the this lang
   * @param toLang translte to this lang
   */
  translateAll(fromLang: string, toLang: string) {
    this.translateAllIn(document.body, fromLang, toLang)
  }

  /**
   * Help to debug a lang to another one by prefixing text which are not translated from the current lang
   * to the given one. NOTE: the translations should exist in the current lang. So if you are in english
   * try to translate "this is a test" in french, but the translation don't exist in the en.json, it will stay like
   * it is. If the key don't exist in the fr.json, it will become "[NOT TRANSLATED IN fr] this is a test"
   * @param lang the lang you want to debug
   */
  debug(lang: string) {
    document.querySelectorAll("*").forEach((elem) => {
      const key = this.getFromValue(elem.innerHTML)
      if (!key) return;
      if (!this.getFromKeyForLang(key as any, lang as any)) {
        elem.innerHTML = `[NOT TRANSLATED IN ${lang}] ${elem.innerHTML}`;
        (elem as HTMLElement).style.fontSize = "12px";
        (elem as HTMLElement).style.lineHeight = "12px";
      }
    })
  }

  /**
   * Parse a string and return it formated
   * @param value 
   * @param data 
   */
  translationParser(value: string) {
    //Break line
    value = value.replace(/\n/g, "\n<br>")

    //Dialog
    value = value.replace(/%SPEECH_ON%/g, "\n<br>\n<br><span style=\"color:#bcad8c\">\"")
    value = value.replace(/%SPEECH_OFF%(.)/g, "\"</span>\n<br>\n<br>$1")

    //Image
    value = value.replace(/\[img\]/g, "<img src=\"coui://")
    value = value.replace(/\[\/img\]/g, "\">")

    return value
  }

  reverseTranslationParser(value: string): string {
    //Dialog
    value = value.replace(/\n<br>\n<br><span style=\"color:#bcad8c\">\"/g, "%SPEECH_ON%")
    value = value.replace(/"<\/span>(\n<br>\n<br>)*/g, "%SPEECH_OFF%")

    //Image
    value = value.replace(/<img src=\"coui:\/\//g, "[img]")
    value = value.replace(/\">/g, "[/img]")

    //Break line
    value = value.replace(/\n<br>/g, "\n")

    return value
  }

  /**
   * Extract the data which is in the dom value based on the translation value and the postion of the placeholders
   * @param domValue 
   * @param translationValue 
   * @returns 
   */
  dataExtractor(domValue:string, translationValue:string): string[]{
    const splittedTranslatedValue = translationValue.split(/%.*?%/g)
    //sanitize regex
    splittedTranslatedValue.forEach((r,i,o)=>{
        o[i] = escapeRegExp(r)
    })

    const regex = new RegExp(splittedTranslatedValue.join("(.*?)"))
    var result = regex.exec(domValue)
    result?.shift()
    return result?result:[];
  }

  dataInjector(translation:string, dataList:string[]){
    dataList.forEach((data)=>{
      translation = translation.replace(/%.*?%/, data)
    })
    return translation
  }
}

(window as any).i18n = new LocalizedBrothers();
(window as any).registerScreen(LocalizedBrothers.id, new LocalizedBrothers());