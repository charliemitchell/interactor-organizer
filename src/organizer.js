const Context = require("./context");

module.exports = class Organizer {
  constructor(...methods) {
    this.methods = methods;
  }

  async call(initialContext) {
    if (initialContext instanceof Context) {
      this.context = initialContext;
    } else {
      this.context = new Context(initialContext);
    }

    const { methods, context } = this;

    try {

      if (this.skip && (await this.skip.apply(this))) return context;
      if (this.around) await this.around.apply(this);
      if (this.before) await this.before.apply(this);
      if (this.after) await this.after.apply(this);

      for (var i = 0; i < methods.length; i += 1) {
        if (methods[i] instanceof Organizer) {
          await methods[i].call(context);
          continue;
        }

        const task = new methods[i]();

        if (task.skip && (await task.skip.apply(this))) continue;
        if (task.around) await task.around.apply(this);
        if (task.before) await task.before.apply(this);
        await task.call.apply(this);
        if (task.after) await task.after.apply(this);
        if (task.around) await task.around.apply(this);
      }
    } catch (err) {
      context.fail(err);
      return context;
    }

    if (this.after) await this.after.apply(this);
    if (this.around) await this.around.apply(this);

    context.success = true;

    return context;
  }
}
