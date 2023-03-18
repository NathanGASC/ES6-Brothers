import 'core-js/actual';
import fr from "./translations/fr.json"
import en from "./translations/en.json"
import {isAncestorOf} from "./utils/isParent"

console.log(Array.from([1,2,3]))

class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";
  dictionary = { fr, en }
  private currentLang: keyof typeof this.dictionary = "en"

  constructor() {
    this.translateAll()
  }

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;
  }

  setCurrentLang(lang: keyof typeof this.dictionary) {
    this.setCurrentLang(lang)
  }

  getFromKey(key: keyof typeof en) {
    this.getFromKeyForLang(key, this.currentLang)
  }

  getFromKeyForLang(key: keyof typeof en, lang: keyof typeof this.dictionary) {
    return this.dictionary[lang][key]
  }

  getFromValue(value: string) {
    return this.getFromValueForLang(value, this.currentLang)
  }

  getFromValueForLang(value: string, lang: keyof typeof this.dictionary) {
    for (const key in this.dictionary[lang]) {
      const _value = this.dictionary[lang][key as keyof typeof en]
      if (_value == value) return key
    }
  }

  translateElement(element:HTMLElement){
    if(isAncestorOf(document.querySelector("#console"), element)) return;
    const text = element.textContent;
    const key = this.getFromValueForLang(text, "en");
    if(!key) return;
    const newText = this.getFromKeyForLang(key as any, "fr");
    element.textContent = newText;
  }

  translateAll(){

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