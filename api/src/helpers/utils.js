function filterFields(fields, filter) {
    const filtered = {};
    for(let field of filter) if(fields[field]) filtered[field] = fields[field];
    return filtered;
}

module.exports = { filterFields };
