const ctx: Worker = self as any;

import 'core-js/actual/dom-collections/for-each';
import 'core-js/actual/array/virtual/find-index';

import fr from "./translations/fr.json"
import en from "./translations/en.json"
import { escapeRegExp } from "./utils/escapeRegExp"

import { GetKeyFor, GetValueFor, TranslateStringCallback } from "./index"

class LocalizedBrothersWorker {
    dictionary = { fr, en }

    constructor() {

    }

    /**
     * Get a key from a value in the given lang.
     * @param value the value which need to be finded to return is key
     * @param lang the lang which should have this value
     * @returns the key or udnefined if doesn't exist
     */
    getKeyFor(value: string, lang: keyof typeof this.dictionary) {
        for (const key in this.dictionary[lang]) {
            var _value = this.dictionary[lang][key as keyof typeof en]

            //Build a regex which will accept everything as value between 2 "%".
            var builtRegex = "^" + (escapeRegExp(_value)).replace(/\\\(%(.*?)%\\\)/g, ".*") + "$"
            var finalRegex = new RegExp(builtRegex, "gm")

            if (finalRegex.test(value)) return key
        }
        return;
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
        var translationKey = this.getKeyFor(domTextFormated, fromLang as any);
        if (!translationKey) return { translation: undefined, key: undefined }
        var oldTranslation = this.getValueFor(translationKey as any, fromLang as any) as string
        oldTranslation = this.translationParser(oldTranslation)
        var data = this.dataExtractor(domText, oldTranslation)
        data = this.translateData(data, fromLang, toLang);
        var newText = this.getValueFor(translationKey as any, toLang as any);
        if (!newText) return { translation: undefined, key: undefined };
        newText = this.translationParser(newText)
        newText = this.dataInjector(newText, data);
        return { translation: newText, key: translationKey }
    }

    /**
     * Get a translation using a key for a given lang
     * @param key the key of the wanted translation
     * @param lang the lang which should have this key
     * @returns the tranlsation for the given key/lang or undefined if not
     */
    getValueFor(key: keyof typeof en, lang: keyof typeof this.dictionary) {
        return this.dictionary[lang][key]
    }

    /**
     * Translate the data if needed. For example if a data is a difficulty "beginner", we want to translate it.
     * @param data a data array to translate
     * @param fromLang from a given lang
     * @param toLang to another lang
     * @returns return the same array but translated if possible
     */
    private translateData(data: string[], fromLang: string, toLang: string) {
        data.forEach((v, i, o) => {
            const dataKey = this.getKeyFor(v, fromLang as any)
            if (dataKey) {
                var newTranslation = this.getKeyFor(dataKey as any, toLang as any)
                if (newTranslation) {
                    o[i] = newTranslation
                }
            }
        })
        return data;
    }

    /**
     * Parse a string and return it formated
     * @param value a SQ fomated string
     */
    private translationParser(value: string) {
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

    /**
     * Parse a string and return it formated
     * @param value a HTML fromated string
     */
    private reverseTranslationParser(value: string): string {
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
     * @param domValue the html which have been taken from the page and which contain data
     * @param translationValue the equivalant translation in the same language
     * @returns the array of data which was in domValue
     */
    private dataExtractor(domValue: string, translationValue: string): string[] {
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

    //TODO: handle tag for data. This way even if params aren't displayed in the same order, we can translate
    /**
     * Inject data in the new translation
     * @param translation the translation string
     * @param dataList the data which are to be inserted
     * @returns the string with the data
     */
    private dataInjector(translation: string, dataList: string[]) {
        dataList.forEach((data) => {
            translation = translation.replace(/\(%.*?%\)/, data)
        })
        return translation
    }
}

var instance = new LocalizedBrothersWorker()

ctx.addEventListener("message", (event) => {
    var returnData: (TranslateStringCallback | GetKeyFor | GetValueFor | undefined | { id?: number }) & { id?: number } | undefined = undefined
    switch (event.data.call) {
        case "translateString":
            returnData = instance.translateString(event.data.args[0], event.data.args[1], event.data.args[2]) as TranslateStringCallback
            break;
        case "getKeyFor":
            returnData = {
                key: instance.getKeyFor(event.data.args[0], event.data.args[1])
            } as GetKeyFor
            break;
        // case "GetValueFor":
        //     returnData = {
        //         value: instance.getValueFor(event.data.args[0], event.data.args[1])
        //     } as GetValueFor
        //     break;
        default:
            break;
    }

    if (!returnData) returnData = {}
    returnData.id = event.data.id
    ctx.postMessage(returnData);
});