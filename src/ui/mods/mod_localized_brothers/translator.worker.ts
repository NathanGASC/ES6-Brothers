const ctx: Worker = self as any;

import 'core-js/actual/dom-collections/for-each';
import 'core-js/actual/array/virtual/find-index';

import fr from "./translations/fr.json"
import en from "./translations/en.json"
import { escapeRegExp } from "./utils/escapeRegExp"

class LocalizedBrothersWorker {
  dictionary = { fr, en }

  constructor() {

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
   * Get a key from a value in the given lang.
   * @param value the value which need to be finded to return is key
   * @param lang the lang which should have this value
   * @returns the key or udnefined if doesn't exist
   */
  getFromValueForLang(value: string, lang: keyof typeof this.dictionary) {
    for (const key in this.dictionary[lang]) {
      var _value = this.dictionary[lang][key as keyof typeof en]

      //Build a regex which will accept everything as value between 2 "%".
      var builtRegex = "^" + (escapeRegExp(_value)).replace(/\\\(%(.*?)%\\\)/g, ".*") + "$"
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
  translateString(value: string, fromLang: string, toLang: string) {
    const domText = value;
    const domTextFormated = this.reverseTranslationParser(value);
    var translationKey = this.getFromValueForLang(domTextFormated, fromLang as any);
    if (!translationKey) {
      return {translation:undefined, key:undefined}
    }
    var oldTranslation = this.getFromKeyForLang(translationKey as any, fromLang as any) as string
    oldTranslation = this.translationParser(oldTranslation)
    var data = this.dataExtractor(domText, oldTranslation)
    data = this.translateData(data, fromLang, toLang);
    var newText = this.getFromKeyForLang(translationKey as any, toLang as any);
    newText = this.translationParser(newText)
    newText = this.dataInjector(newText, data);
    return {translation:newText, key:translationKey}
  }

  /**
   * Translate the data if needed. For example if a data is a difficulty "beginner", we want to translate it.
   * @param data a data array to translate
   * @param fromLang from a given lang
   * @param toLang to another lang
   * @returns return the same array but translated if possible
   */
  translateData(data: string[], fromLang: string, toLang: string) {
    data.forEach((v, i, o) => {
      const dataKey = this.getFromValueForLang(v, fromLang as any)
      if (dataKey) {
        var newTranslation = this.getFromKeyForLang(dataKey as any, toLang as any)
        if (newTranslation) {
          o[i] = newTranslation
        }
      }
    })
    return data;
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
    value = value.replace(/%SPEECH_OFF%/g, "\"</span>")

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
  dataExtractor(domValue: string, translationValue: string): string[] {
    const splittedTranslatedValue = translationValue.split(/\(%.*?%\)/)
    //sanitize regex
    splittedTranslatedValue.forEach((r, i, o) => {
      o[i] = escapeRegExp(r)
    })
    

    const regex = new RegExp(splittedTranslatedValue.join("(.*)"))
    var result = regex.exec(domValue);

    result?.shift()
    return result ? result : [];
  }

  dataInjector(translation: string, dataList: string[]) {
    dataList.forEach((data) => {
      translation = translation.replace(/\(%.*?%\)/, data)
    })
    return translation
  }
}

var instance = new LocalizedBrothersWorker()

ctx.addEventListener("message", (event) => {
    var returnData:any = null
    switch (event.data.call) {
        case "translateString":
            returnData = instance.translateString(event.data.args[0], event.data.args[1], event.data.args[2])
            break;
        case "test":
            returnData = event.data
            break;
        default:
            break;
    }
    returnData.id = event.data.id
    ctx.postMessage(returnData);
});