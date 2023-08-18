# interactor-organizer
This implements the interactor/organizer dsegn pattern in javascript.

```sh
yarn add interactor-organizer
```

Example: create an organizer to handle updating some object in your system
update-model.js
```js
const Organizer = require("interactor-organizer/organizer")
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

Valid Interactors: There are many ways to write a valid interactor, they can be object oriented or functional.
OOP
```js
  module.exports = class UpdateTheModel {
    get req () {
      return this.context.req
    }

    async call () {
      await this.context.model.findOneAndUpdate(req.params.id, req.body)
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
    around () {
      console.log("I get called before anything, and after everything")
    }

    get req () {
      return this.context.req
    }

    async call () {
      await this.context.model.findOneAndUpdate(req.params.id, req.body)
    }
  }
```

Functional with no hooks
```js
  module.exports = async function UpdateTheModel () {
    const { params, req } = this.context
    await this.context.model.findOneAndUpdate(params.id, req.body)
  }
```

Functional with hooks
```js
  
  async function UpdateTheModel () {
    await this.context.model.findOneAndUpdate(id, body)
  }

  Object.assign(UpdateTheModel, {
    before () {
      if (!this.context.model) {
        this.context.fail("a model is required")
      }
    }
    after () {
      console.log("The model was updated")
    }
    around () {
      console.log("I get called before anything, and after everything")
    }
  })
```

Use the skip hook to make interactors optional. return truthy to skip, falsey to invoke
```js
module.exports = class UpdateTheModel {
  skip () {
    return !this.context.model
  }

  get req () {
    return this.context.req
  }

  async call () {
    await this.context.model.findOneAndUpdate(req.params.id, req.body)
  }
}
```

Or
```js
async function UpdateTheModel () {
  await this.context.model.findOneAndUpdate(id, body)
}

UpdateTheModel.skip = () {
  return !this.context.model
}
```

You can do the same thing with organizers too.
```js
class UpdateTheModelOrganizer extends Organizer {
  static async skip () {
    return !this.context.model
  }
  static async before () {}
  static async after () {}
  static async around () {}
}

module.exports = new UpdateTheModelOrganizer(
  updateTheModel,
  alertTheBusiness,
  organizeEmailSends
)
```

OR

```js
const UpdateTheModelOrganizer = new Organizer(
  updateTheModel,
  alertTheBusiness,
  organizeEmailSends
)

UpdateTheModelOrganizer.skip = async () {
  return !!this.context.model
}
```