import rateLimit from '../../../modules/rate-limit';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { authenticateRestaurantAccess } from '../../../modules/user';
import SeatingAreas from '../SeatingAreas';
import Bookings from '../../Bookings/Bookings';

/**
 * Just a refactored, helper function to check() data used by the methods.
 *
 * @param {Object} doc The object that represents the seating area's data.
 * @param {string} restaurantId ID of the restaurant
 * @param {string | undefined} seatingAreaId ID of the seating area in case of an update.
 */
const checkSeatingAreaData = (doc, restaurantId, seatingAreaId) => {
	/**
	 * Simply checking that "doc" is an object like in the previous code, is probably not enough.
	 * check() is intended to help developers the most by throwing a detailed exception to the server
	 * logs and also during debugging so in this case, we want to make the check a bit more precise
	 * to help us catch errors easily.
	 */
	check(doc, {
		name: String,
		bookable: Boolean,
		bookableOnline: Boolean,
		bookingPriority: Number,
		note: String,
		internalNote: String,
	});

	check(restaurantId, String);

	// Check seatingAreaId only if defined i.e. in case of update.
	if (seatingAreaId) {
		check(seatingAreaId, String);
	}
};

Meteor.methods({
	/* Add a new seating area */
	'seatingAreas.insert': function seatingAreasInsert(restaurantId, doc) {
		/**
		 * It's good practice and sometimes important to authenticate and authorize a user first
		 * before any other processing. In previous code, the check() methods were called before
		 * authorization check.
		 *
		 * Also instead of declaring a const user = Meteor.user(), why not just pass Meteor.user() directly
		 * to the authenticateRestaurantAccess() function? Because the newly created user constant is never
		 * used again so let's save some tiny space in the memory.
		 *
		 * Also, since Meteor.user() makes an actual database call and fetches the entire user object,
		 * I would definitely use the options argument to fetch only the fields that are needed. Since I
		 * don't know what the authenticateRestaurantAccess() does with the user object, I will leave it
		 * as is.
		 */
		authenticateRestaurantAccess(Meteor.user(), restaurantId, [
			'tables',
			'apps',
		]);

		checkSeatingAreaData(doc, restaurantId);

		/**
		 * I would add a proper data validation logic and return user friendly error messages.
		 * Although data is first validated on the client side for faster response, it however can
		 * be easily bypassed and therefore validating the data again on the server becomes necessary.
		 *
		 * The check() method in Meteor is not intended for validating user input data. It's for validating
		 * data types in terms of the code itself which can also be used to avoid malicious query injection.
		 *
		 * Since I have no context of the rest of the application and, it also seems a bit out of scope for this
		 * test, I will leave adding proper user input data validation logic for now.
		 */

		try {
			/**
			 * Instead of using the . notation to add new keys, a spread operator is a bit more ESNext-y
			 * and just a preference. Also I think it reads a bit better.
			 *
			 * Oh, and notice I also changed the Meteor.userId() call to this.userId
			 * Meteor.userId() is reactive and meanly intended for the client side. Meteor says that
			 * there are also certain edge cases when dealing with async code because Meteor.userId() is global
			 * and stateful i.e. Reactive.
			 */
			const seatingArea = {
				...doc,
				restaurantId,
				createdBy: this.userId,
				createdAt: new Date(),
			};

			return SeatingAreas.insert(seatingArea);
		} catch (error) {
			/**
			 * The default error messages thrown are not user friendly. I see that the client side code that
			 * makes use of this method also displays a generic error message regardless of what happens here.
			 *
			 * I am referring to this bit in AreaForm.jsx
			 *
			 * ```js
			 * enqueueSnackbar(i18n.__('common.error.something_went_wrong'), {variant: 'error',});
			 * ```
			 *
			 * That "common.error.something_went_wrong" seems like a generic message. Since I don't have full
			 * context of the rest of the app, I may not be able to do much about it just yet, still just wanted
			 * to highlight that this is definitely one more thing that I would do.
			 *
			 * I will return bespoke error messages that are user friendly and informs the user about exactly what
			 * went wrong. As I also mentioned above, this error handling logic is a lot of work and would also be
			 * used by user input data validation when added.
			 */
			throw new Meteor.Error(
				'seatingAreas.insert: exception',
				error.message,
				`restaurantId: ${restaurantId} userId: ${this.userId}`,
			);
		}
	},

	/* Updates a seating area */
	'seatingAreas.update': function seatingAreasUpdate(
		restaurantId,
		seatingAreaId,
		doc,
	) {
		/**
		 * Since this method is pretty similar to the one above, I will not repeat the comments I have written in the
		 * above method. All of those also apply here.
		 */

		authenticateRestaurantAccess(Meteor.user(), restaurantId, [
			'tables',
			'apps',
		]);

		checkSeatingAreaData(doc, restaurantId, seatingAreaId);

		try {
			const seatingArea = {
				...doc,
				updatedBy: this.userId,
				updatedAt: new Date(),
			};

			const update = SeatingAreas.update(
				{ _id: seatingAreaId, restaurantId },
				{
					$set: seatingArea,
				},
			);

			// Update area name on future bookings if it changed
			Meteor.wrapAsync(
				Bookings.rawCollection().update(
					{
						restaurantId,
						dateTime: { $gt: new Date() },
						tables: { $exists: true },
					},
					{
						$set: {
							'tables.$[table].area.name': seatingArea.name,
							'tables.$[table].area.internalNote':
								seatingArea.internalNote,
						},
					},
					{
						arrayFilters: [
							{
								'table.area._id': seatingAreaId,
								$or: [
									{
										'table.area.name': {
											$ne: seatingArea.name,
										},
									},
									{
										'table.area.internalNote': {
											$ne: seatingArea.internalNote,
										},
									},
								],
							},
						],
						multi: true,
					},
				),
			);

			return update;
		} catch (error) {
			// There was a console.log statement here. I removed it as it seemed unnecessary.
			throw new Meteor.Error(
				'seatingAreas.update: exception',
				error.message,
				`restaurantId: ${restaurantId} seatingAreaId: ${seatingAreaId} userId: ${this.userId}`,
			);
		}
	},
});

rateLimit({
	methods: ['seatingAreas.insert'],
	limit: 5,
	timeRange: 1000,
});
