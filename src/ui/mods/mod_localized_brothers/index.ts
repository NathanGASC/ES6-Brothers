import 'core-js/actual';
import fr from "./translations/fr.json"
import en from "./translations/en.json"
import {isAncestorOf} from "./utils/isParent"

class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";
  dictionary = { fr, en }
  private currentLang: keyof typeof this.dictionary = "en"

  constructor() {
  }

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;
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
      const _value = this.dictionary[lang][key as keyof typeof en]
      if (_value == value) return key
    }
  }

  /**
   * Translate an element from a specific lang to another. The innerHTML of this element will be searched in the translations
   * to get the translation key from the old language and translate it to another one.
   * @param element the element to translate
   * @param fromLang the old lang which should be the lang of the text in the given element
   * @param toLang the new lang which should replace the old one
   */
  translateElement(element:HTMLElement, fromLang:string, toLang:string){
    const text = element.innerHTML;
    const key = this.getFromValueForLang(text, fromLang as any);
    if(!key) return;
    const newText = this.getFromKeyForLang(key as any, toLang as any);
    element.textContent = newText;
  }

  /**
   * Translate all element in the page. Don't call it too much as it resources conssuming
   * @param root the element containing every element you want to translate. Less this element have shild, less it will be resource consumming
   * @param fromLang translate from the this lang
   * @param toLang translte to this lang
   */
  translateAllIn(root:HTMLElement, fromLang:string, toLang:string){
    root.querySelectorAll("*").forEach((elem)=>{
        this.translateElement(elem as HTMLElement, fromLang, toLang)
    })
  }

  /**
   * Translate all element in the page. Don't call it too much as it resources conssuming
   * @param fromLang translate from the this lang
   * @param toLang translte to this lang
   */
  translateAll(fromLang:string, toLang:string){
    document.querySelectorAll("*").forEach((elem)=>{
        this.translateElement(elem as HTMLElement, fromLang, toLang)
    })
  }
}

var mutationObserver = new MutationObserver((mutationList) => {
  mutationList.forEach((mutation)=>{
    (window as any).i18n.translateElement(mutation.target as HTMLElement)
  })
})
mutationObserver.observe(document, { childList: true, subtree: true });

(window as any).i18n = new LocalizedBrothers();
(window as any).registerScreen(LocalizedBrothers.id, new LocalizedBrothers());