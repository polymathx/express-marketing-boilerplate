class TemplateHelpers {

    static fieldsFromPage(arr, id) {
        return arr.find(x => x.identifier === id);
    }

    static componentFromPage(arr, id) {
        return arr.components.find(x => x.identifier === id);
    }

}

module.exports = TemplateHelpers;