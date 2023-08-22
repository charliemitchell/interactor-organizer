const { Organizer } = require("../index");
const {
  UploadFile,
  ProcessFile,
  SendCommunications,
  CreateAccountOrganizer,
  CreateValidAccount,
  ValidateUser,
  AllHooks,
  SetsAValue,
  HasException
} = require("./interactors");

const organizer = new Organizer(UploadFile, ProcessFile, SendCommunications);

test("syntax", async () => {
  const ctx = await organizer.call({ id: 123 });

  expect(ctx.file).toBe("tmp/some-file.ext");
  expect(ctx.processedFile).toBe("tmp/processed-file.ext");
});

test("It doesn't leak", async () => {
  const ctx1 = await organizer.call({ id: 123 });
  const ctx2 = await organizer.call({ id: 124 });

  expect(ctx1.id).toBe(123);
  expect(ctx2.id).toBe(124);
});

test("It can organize organizers", async () => {
  const ctx = await CreateValidAccount.call({
    userParams: { name: "test" },
  });

  expect(ctx.validUser).toBe(true);
  expect(ctx.user.name).toBe("test");
  expect(ctx.currentUser.name).toBe("test");
  expect(ctx.emails.length).toBe(1);
  expect(ctx.communicationsDelivered.length).toBe(1);
});

test("It will skip an organizer", async () => {
  const ctx = await CreateAccountOrganizer.call({ userParams: { noname: "" } });

  expect(ctx.user).toBe(undefined);
  expect(ctx.currentUser).toBe(undefined);
  expect(ctx.emails).toBe(undefined);
  expect(ctx.communicationsDelivered).toBe(undefined);
});

test("Failing a context from within an interactor", async () => {
  const organizer = new Organizer(ValidateUser)
  var ctx = await organizer.call({ userParams: undefined });
  expect(ctx.failure).toBe(true)
  expect(ctx.success).toBe(false)
});

test("Failing a context from within an organizer", async () => {
  class Failable extends Organizer {
    before () {
      this.context.fail("oops")
    }
  }

  const organizer = new Failable(ValidateUser)
  var ctx = await organizer.call({ userParams: { name: "test" } });
  expect(ctx.failure).toBe(true)
  expect(ctx.success).toBe(false)
  expect(ctx.validUser).toBe(undefined)
});

test("Interactor Hooks", async () => {
  const organizer = new Organizer(AllHooks)
  var ctx = await organizer.call({});
  expect(ctx.before).toBe(true)
  expect(ctx.after).toBe(true)
  expect(ctx.call).toBe(true)
})

test("Organizer Hooks", async () => {
  class Hooks extends Organizer {
    skip () {
      this.context.skip = true;
    }
    before () {
      this.context.before = true;
    }
    after () {
      this.context.after = true;
    }
  }
  const organizer = new Hooks(UploadFile)
  var ctx = await organizer.call({});
  expect(ctx.before).toBe(true)
  expect(ctx.after).toBe(true)
  expect(ctx.skip).toBe(true)
})

test("An exception stops execution, and fails the context", async () => {
  const organizer = new Organizer(HasException, SetsAValue)
  var ctx = await organizer.call({});
  expect(ctx.value).toBe(undefined)
  expect(ctx.failure).toBe(true)
})

test("the value of `this` is that of the interactor", async () => {
  class MyInteractor {
    call () {
      this.setValue()
    }

    setValue () {
      this.context.value = true
    }
  }

  const organizer = new Organizer(MyInteractor)
  var ctx = await organizer.call({});
  expect(ctx.error).toBe(undefined)
  expect(ctx.failure).toBe(false)
  expect(ctx.value).toBe(true)
})