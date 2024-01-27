class validation { 
    TotalValidator(requiredFeilds){
        const missingFeilds = Object.entries(requiredFeilds).filter(([feilds, value]) => typeof value == 'undefined').map(([feilds, value]) => feilds)
        const errors = missingFeilds.join(' ')
        const errorSentence = `${errors} ${missingFeilds.length == 1 ? 'is' : 'are'} required`
        return missingFeilds.length == 0 ? null : errorSentence
    }
}

module.exports = new validation()

