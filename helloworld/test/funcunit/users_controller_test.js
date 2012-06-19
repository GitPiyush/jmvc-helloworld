/*global module: true, ok: true, equals: true, S: true, test: true */
module("users", {
	setup: function () {
		// open the page
		S.open("//helloworld/helloworld.html");

		//make sure there's at least one users on the page before running a test
		S('.users').exists();
	},
	//a helper function that creates a users
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.users:nth-child(2)').exists();
	}
});

test("users present", function () {
	ok(S('.users').size() >= 1, "There is at least one users");
});

test("create users", function () {

	this.create();

	S(function () {
		ok(S('.users:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit users", function () {

	this.create();

	S('.users:nth-child(2) a.edit').click();
	S(".users input[name=name]").type(" Water");
	S(".users input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.users:nth-child(2) .edit').exists(function () {

		ok(S('.users:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.users:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".users:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.users:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});