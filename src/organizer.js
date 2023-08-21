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
      try {
        // Call hooks of the Organizer Class
        if (this.skip && (await this.skip.apply(this))) return context;
        if (this.before) await this.before.apply(this);
        if (this.after) await this.after.apply(this);

        for (var i = 0; i < methods.length; i += 1) {
          if (methods[i] instanceof Organizer) {
            await methods[i].call(context);
            continue;
          }

          const task = new methods[i]();
          // Call hooks of the Interactor Class
          if (task.skip && (await task.skip.apply(this))) continue;
          if (task.before) await task.before.apply(this);
          await task.call.apply(this);
          if (task.after) await task.after.apply(this);
        }
      } catch (err) {
        if (err.name != "FailedContextError") context.fail(err);
        return context;
      }
    } catch (err) {
      return context;
    }
    // Call the after method of the Organizer Class
    if (this.after) await this.after.apply(this);
    // No Failures or exceptions
    context.success = true;

    return context;
  }
};
