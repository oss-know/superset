const strategies = {
  isNonEmpty(value, errMsg) {
    if (value === '') {
      return errMsg;
    }
  },
  minLenth(value, length, errMsg) {
    if (value.length < length) {
      return errMsg;
    }
  },
  isMobile(value, errMsg) {
    if (!/^1[3|5|8][0-9]{9}$/.test(value)) {
      return errMsg;
    }
  },
};

export default class Validator {
  constructor() {
    this.cache = [];
  }

  add(value, rule, errMsg) {
    const arr = rule.split(':');
    this.cache.push(() => {
      const strategy = arr.shift();
      arr.unshift(value);
      arr.push(errMsg);
      return strategies[strategy](value, errMsg);
    });
  }

  start() {
    for (let i = 0; i < this.cache.length; i++) {
      const msg = this.cache[i]();
      if (msg) return msg;
    }
  }
}
