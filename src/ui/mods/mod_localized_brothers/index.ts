import 'core-js/actual/dom-collections/for-each';
import 'core-js/actual/array/virtual/find-index';
// @ts-ignore: File is not a module
import WorkerTranslator from "worker-loader!./translator.worker";

import fr from "./translations/fr.json"
import en from "./translations/en.json"
import { escapeRegExp } from "./utils/escapeRegExp"

class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";
  dictionary = { fr, en }
  private currentLang: keyof typeof this.dictionary = "en"
  private workerTranslator:Worker = new WorkerTranslator()
  private uniqueWorkerId:number = 0;

  constructor() {

  }

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;

    //Overwrite $(...).html to translate.
    (window as any).jQuery.fn.origHtml = (window as any).jQuery.fn.html;
    (window as any).jQuery.fn.html = function (html: string) {
      if (html != undefined) {
        this[0].innerHTML = html;
      } else {
        return this[0].innerHTML
      }
      i18n.translateAllIn(this[0] as HTMLElement, "en", i18n.getCurrentlang());
    };

    //Overwrite $(...).text to translate
    (window as any).jQuery.fn.origText = (window as any).jQuery.fn.text;
    (window as any).jQuery.fn.text = function () {
      var temp = (window as any).jQuery.fn.origText.apply(this, arguments);
      i18n.translateElement(this[0] as HTMLElement, "en", i18n.getCurrentlang());
      return temp
    };

    //Overwrite $(...)
    var orignalInit = (window as any).$.prototype.init;
    (window as any).$.prototype.init = (selector: any, context: any) => {
      var instanceJquery = new orignalInit(selector, context)
      if(instanceJquery[0] instanceof HTMLElement) {
        this.translateElement(instanceJquery[0], "en", this.currentLang)
      }
      return instanceJquery
    }
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
   * @returns the current lang
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
   * Translate an element from a specific lang to another. The innerHTML of this element will be searched in the translations
   * to get the translation key from the old language and translate it to another one.
   * @param element the element to translate
   * @param fromLang the old lang which should be the lang of the text in the given element
   * @param toLang the new lang which should replace the old one
   */
  translateElement(element: HTMLElement, fromLang: string, toLang: string) {
    const domText = element.innerHTML;
    //TODO: Optimisation work here to avoid translating things which don't need to
    //If no text, no translation
    if(element.textContent == "" || element.textContent == undefined) return
    //If same key, same text, stay inchanged
    var oldKey = element.dataset.i18nKey;
    if(oldKey != undefined && oldKey == (i18n.dictionary as any)[this.currentLang][oldKey]){
      return;
    }
    if(!isNaN(parseInt(element.textContent))) return

    var uniqueIdClone = this.uniqueWorkerId++
    var onTranslation = (event: MessageEvent<any>) => {
      if(event.data.id != uniqueIdClone) return
      (console as any).reverseLog(`[${fromLang} => ${toLang}] ${element.innerHTML} => ${event.data.translation}`)
      if (event.data == undefined || event.data.translation == undefined) return
      element.dataset.i18nKey = event.data.key; 
      element.innerHTML = event.data.translation;
    };

    this.workerTranslator.addEventListener("message", onTranslation, {once:true});

    //Proceed to the translation
    this.workerTranslator.postMessage({
      call:"translateString",
      args:[domText, fromLang, toLang],
      id: uniqueIdClone
    })

    //Proceed to the translation
    // var data = this.translateString(domText, fromLang, toLang)
    // if (data == undefined) return
    // element.dataset.i18nKey = data.key; 
    // element.innerHTML = data.translation;
  }

  /**
   * Translate all element in the page. Don't call it too much as it resources conssuming
   * @param root the element containing every element you want to translate. Less this element have shild, less it will be resource consumming
   * @param fromLang translate from the this lang
   * @param toLang translte to this lang
   */
  translateAllIn(root: HTMLElement, fromLang: string, toLang: string) {
    this.translateElement(root as HTMLElement, fromLang, toLang)
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
}

var i18n = new LocalizedBrothers();
(window as any).registerScreen(LocalizedBrothers.id, i18n);
(window as any).i18n = i18n;