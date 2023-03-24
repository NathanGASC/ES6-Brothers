import 'core-js/actual/dom-collections/for-each';
import 'core-js/actual/array/virtual/find-index';
// @ts-ignore: File is not a module
import WorkerTranslator from "worker-loader!./translator.worker";

export type TranslateStringCallback = { translation: string, key: string }
export type GetKeyFor = { key: string }
export type GetValueFor = { value: string }

class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";
  private currentLang: string = "en"
  private workerTranslator: Worker = new WorkerTranslator()
  private uniqueWorkerId: number = 0;

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
      if (instanceJquery[0] instanceof HTMLElement) {
        this.translateElement(instanceJquery[0], "en", this.currentLang)
      }
      return instanceJquery
    }
  }

  /**
   * Short name for "setCurrentLang"
   * @param lang The new lang you want to use (ex:"fr", "en", "ja", ...)
   */
  setLang(lang: string) {
    this.setCurrentLang(lang)
  }

  /**
   * Get a translation using a key for the current lang
   * @param key the key of the wanted translation
   * @returns the tranlsation for the given key/current lang or undefined if not
   */
  getValue(key: string, callback: (value: GetValueFor) => void) {
    return this.getValueFor(key, this.currentLang, callback)
  }

  /**
   * Get a translation using a key for a given lang
   * @param key the key of the wanted translation
   * @param lang the lang which should have this key
   * @returns the tranlsation for the given key/lang or undefined if not
   */
  getValueFor(key: string, lang: string, callback: (data: GetValueFor) => void) {
    this.workerCall<GetValueFor>("getValueFor", [key, lang], (data) => {
      callback(data)
    })
  }

  /**
   * Get a key from a value in the current lang.
   * @param value the value which need to be finded to return is key
   * @returns the key or udnefined if doesn't exist
   */
  getKey(value: string, callback: (key: GetKeyFor) => void) {
    return this.getKeyFor(value, this.currentLang, callback)
  }

  /**
   * Get a key from a value in the given lang.
   * @param value the value which need to be finded to return is key
   * @param lang the lang which should have this value
   * @returns the key or udnefined if doesn't exist
   */
  getKeyFor(value: string, lang: string, callback: (data: GetKeyFor) => void) {
    this.workerCall<GetKeyFor>("getFromValueForLang", [value, lang], (data) => {
      callback(data)
    })
  }

  /**
   * Change the current lang to another one. If the lang don't exist, no change
   * will happen.
   * @param lang The new lang you want to use (ex:"fr", "en", "ja", ...)
   */
  setCurrentLang(lang: string) {
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
   * Translate an element from a specific lang to another. The innerHTML of this element will be searched in the translations
   * to get the translation key from the old language and translate it to another one.
   * @param element the element to translate
   * @param fromLang the old lang which should be the lang of the text in the given element
   * @param toLang the new lang which should replace the old one
   */
  translateElement(element: HTMLElement, fromLang: string, toLang: string) {
    const startTime = new Date()
    const domText = element.innerHTML;
    //TODO: Optimisation work here to avoid translating things which don't need to
    //If no text, no translation
    if (element.textContent == "" || element.textContent == undefined) return
    //If same key, same text, stay inchanged
    var oldKey = element.dataset.i18nKey;
    this.getValueFor(oldKey, this.currentLang, (data) => {
      if (oldKey != undefined && domText == data.value) {
        return;
      }
      //If the text is calculation, numbers, don't need to translate
      if (!isNaN(parseInt(element.textContent))) return
      this.workerCall<TranslateStringCallback>("translateString", [domText, fromLang, toLang], (data) => {
        const endTime = new Date();
        (console as any).reverseLog(`[(${endTime.getTime() - startTime.getTime()}ms)  ${fromLang} => ${toLang}] ${element.innerHTML} => ${data.translation}`)
        if (data == undefined || data.translation == undefined) return
        element.dataset.i18nKey = data.key;
        element.innerHTML = data.translation;
      })
    })

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

  private workerCall<T>(fun: string, args: string[], callback: (data: T) => void) {
    var uniqueIdClone = this.uniqueWorkerId++

    this.workerTranslator.addEventListener("message", (ev) => {
      if (uniqueIdClone != ev.data.id) return
      callback(ev.data)
    }, { once: true });

    this.workerTranslator.postMessage({
      call: fun,
      args: args,
      id: uniqueIdClone
    })
  }
}

var i18n = new LocalizedBrothers();
(window as any).registerScreen(LocalizedBrothers.id, i18n);
(window as any).i18n = i18n;