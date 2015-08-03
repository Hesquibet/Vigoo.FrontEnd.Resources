ko.validation.rules['areSame'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val, otherField) {
        return val === this.getValue(otherField);
    },
    message: 'Les champs doivent être identique'
};
ko.validation.rules['dateFormat'] = {
    validator: function (value, validate) {
        if (!validate) {
            return true;
        }
        return moment(value, "DD/MM/YYYY").isValid();
    },
    message: 'Please enter a proper date.'
};
