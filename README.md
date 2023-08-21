# interactor-organizer
An interactor/organizer design pattern for javascript.

```sh
yarn add interactor-organizer-js
```

Example: create an organizer to handle updating some object in your system
update-model.js
```js
const { Organizer } = require("interactor-organizer")
const organizeEmailSends = require("../email/send-email-updates")

module.exports = new Organizer(
  updateTheModel,
  alertTheBusiness,
  organizeEmailSends
)
```
some-controller.js
```js
  const organizeModelUpdate = require("./users/organizers/update-model.js")

  async handleRequest (req, res) {
    const initialContext = { model: User, req }
    const ctx = await organizeModelUpdate(initialContext)
    if (ctx.success) {
      res.json({you: "did it"})
    }
  }
```

Interactors:
```js
  module.exports = class UpdateTheModel {
    async call () {
      await this.context.model.findOneAndUpdate(req.params.id, this.context.req.body)
    }
  }
```

```js
module.exports = class UpdateTheModel {
  before () {
    if (!this.context.model) {
      this.context.fail("a model is required")
    }
  }
  after () {
    console.log("The model was updated")
  }
  async call () {
    await this.context.model.findOneAndUpdate(req.params.id, this.context.req.body)
  }
}
```

Use the skip hook to make interactors optional. return truthy to skip, falsey to invoke
```js
module.exports = class UpdateTheModel {
  skip () {
    return !this.context.model
  }

  async call () {
    await this.context.model.findOneAndUpdate(req.params.id, {})
  }
}
```


You can do the same thing with organizers too.
```js
class UpdateTheModelOrganizer extends Organizer {
  async skip () {
    return !this.context.model
  }
  async before () {}
  async after () {}
}

module.exports = new UpdateTheModelOrganizer(
  updateTheModel,
  alertTheBusiness,
  organizeEmailSends
)
```
