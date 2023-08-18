const { Organizer } = require("../index");
const {
  UploadFile,
  ProcessFile,
  SendCommunications,
  CreateAccountOrganizer,
  CreateValidAccount,
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
