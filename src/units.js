module.exports = class Units {
  constructor() {
    this._units = {};
    this.initializeUnits();
  }

  addUnit(unit) {
    this._units[unit.name] = unit;
  }


  initializeUnits() {
    // length
    this.addUnit(new Unit('meter', 'm', 1, 'length'));
    this.addUnit(new Unit('centimeter', 'cm', 0.01, 'length'));
    this.addUnit(new Unit('millimeter', 'mm', 0.001, 'length'));

    // mass
    this.addUnit(new Unit('gram', 'g', 0.001, 'mass'));
    this.addUnit(new Unit('kilogram', 'kg', 1, 'mass'));
    this.addUnit(new Unit('ton', 't', 1000, 'mass'));
  }

  convert(value, inputUnit, outputUnit) {
    if (this._units[inputUnit].group !== this._units[outputUnit].group) {
      throw new Error('Different groups');
    }
    return value * this._units[inputUnit].toBaseCoeff / this._units[outputUnit].toBaseCoeff;
  }

  format(value, inputUnit, outputUnit) {
    if (this._units[inputUnit].group !== this._units[outputUnit].group) {
      throw new Error('Different groups');
    }
    return `${this.convert(value, inputUnit, outputUnit)} ${this._units[outputUnit].symbol}`;
  }

  getGroups() {
    let result = [];
    for (let key in this._units) {
      if (!result.includes(this._units[key]._group)) {
        result.push(this._units[key]._group);
      }
    }
    return result;
  }

  getUnits(groupName) {
    let result = [];
    for (let key in this._units) {
      if (this._units[key]._group == groupName) {
        result.push(this._units[key]._name);
      }
    }
    return result;
  }

  // note :
  /* The test "formatWithUnits - integers" has opposite order of "outputUnits",
  so a big part of this function was dedicated to accomodate that,
  I extracted those parts in smaller functions (below this one) to make it cleaner and more readable and testable
  */
  formatWithUnits(inputText, outputUnits) {
    // regex that searches for numbers
    const regex = /-?\d+\.?\d*/g;

    // find matches to the regex in the inputText
    const valueMatches = inputText.match(regex);

    // find the next string after the matched regex, removing spaces
    const unitSymbolsMatches = inputText.match(/-?\d+\.?\d*\s*(\w+)/g).map((x) => x.replace(/\s/g, '').replace(/-?\d+\.?\d*/, ''));

    // getting names of matched unit symbols 
    let unitNames = this.getNameFromSymbol(unitSymbolsMatches);


    // rearrange outputUnits array to match order of units in the text
    let outputUnitsOrdered = this.orderUnits(outputUnits, unitNames);


    //getting output units symbols
    const outputSymbols = this.getSymbolFromName(outputUnitsOrdered);


    //converting values
    let outputValues = [];
    for (let i = 0; i < valueMatches.length; i++) {
      outputValues.push(this.convert(parseFloat(valueMatches[i]), unitNames[i], outputUnitsOrdered[i]));
    }

    let outputText = inputText;
    //converting formats
    for (let i = 0; i < valueMatches.length; i++) {
      outputText = outputText.replace(valueMatches[i] + " " + unitSymbolsMatches[i], outputValues[i] + " " + outputSymbols[i]);
    }
    return outputText;
  }


  //helper functions made specifically for the formatWithUnits() function

  //checking if the order of unit._group of outputUnits is similar to the order of unit._group of matched units and reordering the the outputUnits array to match the order of units in the matched units array
  orderUnits(definedOutput, desiredOutput) {
    let outputUnitsOrdered = [];
    for (let i = 0; i < definedOutput.length; i++) {
      if (this._units[desiredOutput[i]]._group != this._units[definedOutput[i]]._group) {
        outputUnitsOrdered[i] = definedOutput[i + 1];
        outputUnitsOrdered[i + 1] = definedOutput[i];
        break;
      }
      else {
        outputUnitsOrdered[i] = definedOutput[i];
      }
    }
    return outputUnitsOrdered
  }

  getNameFromSymbol(unitSymbols) {
    let unitNames = [];
    for (let i = 0; i < unitSymbols.length; i++) {
      for (let key in this._units) {
        if (this._units[key]._symbol == unitSymbols[i]) {
          unitNames.push(this._units[key]._name);
          break;
        }
      }
    }
    return unitNames;
  }

  getSymbolFromName(unitNames) {
    let unitSymbols = [];
    for (let i = 0; i < unitNames.length; i++) {
      for (let key in this._units) {
        if (this._units[key]._name == unitNames[i]) {
          unitSymbols.push(this._units[key]._symbol);
          break;
        }
      }
    }
    return unitSymbols;
  }
}

class Unit {
  constructor(name, symbol, toBaseCoeff, group) {
    this._name = name;
    this._symbol = symbol;
    this._toBaseCoeff = toBaseCoeff;
    this._group = group;
  }

  get name() {
    return this._name;
  }

  get symbol() {
    return this._symbol;
  }

  get toBaseCoeff() {
    return this._toBaseCoeff;
  }

  get group() {
    return this._group;
  }
}
