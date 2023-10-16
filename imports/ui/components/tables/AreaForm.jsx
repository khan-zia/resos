import { useCallback, useEffect, useState } from 'react';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { isAppActive } from '../../../modules/restaurants';
import Loading from '../Loading/Loading';
import { generateRwgSnackbarString } from '../../../modules/util';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import BookableControl from './BookableControl';
import NameControl from './NameControl';
import BookingPriorityControl from './BookingPriorityControl';
import InternalNoteControl from './InternalNoteControl';

const T = i18n.createComponent();

/**
 * Changed the HOC-based withStyles call to the makeStyles one which returns
 * a React hook that can be used directly in a functional component.
 */
const useStyles = makeStyles((theme) => ({
	root: {
		'& .MuiFormHelperText-root': {
			marginLeft: 0,
		},
	},
	dialogActions: {
		justifyContent: 'flex-start',
		padding: theme.spacing(2, 3),
	},
	dialogContent: {
		[theme.breakpoints.down('sm')]: {
			height: 'calc(100vh - 136px)',
			overflow: 'auto',
		},
	},
	submitButton: {
		minWidth: 200,
	},
	deleteButton: {
		minWidth: 100,
	},
}));

const AreaForm = (props) => {
	// Destructure props. Extracting props that are passed on to this component.
	const { area, open, restaurant, onClose, enqueueSnackbar } = props;

	// Collect MUI styles.
	const classes = useStyles();

	// To make the Dialog responsively full screen, we use the useMediaQuery() hook instead of the
	// withMobileDialog HOC like in the previous code.
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	/**
	 * Define component's state.
	 * Since all the data in the state of this component is logically related, It's easier to define
	 * a single object representing all the data. We will initialize all values with the known defaults
	 * or undefined. The values can be re-populated after the initial mount (useEffect call).
	 */
	const [bookingArea, setBookingArea] = useState({
		name: undefined,
		bookable: true,
		bookableOnline: true,
		bookingPriority: 5,
		note: undefined, // "note" wasn't initialized in the old code while it was later added to state in the UNSAFE_componentWillReceiveProps
		internalNote: undefined,
		loading: false,
	});

	/**
	 * This useEffect is a replacement for the UNSAFE_componentWillReceiveProps.
	 * It depends on the passed prop of "area" and the state's "loading".
	 *
	 * There's no need to use the "_.isEqual()" function anymore to compare the
	 * current and previous "areas" as this hook is designed to run automatically
	 * whenever there is a change in one of its dependencies, in this case "area".
	 */
	useEffect(() => {
		if (area && !bookingArea.loading) {
			setBookingArea({
				...bookingArea,
				name: area.name,
				bookable: area.bookable || true,
				bookableOnline: area.bookableOnline || true,
				bookingPriority: area.bookingPriority || 5,
				note: area.note,
				internalNote: area.internalNote,
				// No need to specify loading: false like in the old code because we know it's already set to false
			});
		}
	}, [area, bookingArea.loading]);

	const handleChange = (event) =>
		setBookingArea({
			...bookingArea,
			[event.target.name]: event.target.value,
		});

	/**
	 * The previous code of handleCheckedChange used curried (double) arrow function.
	 * There's no need for explicitly calling this handler with a "field" name as the Switch
	 * component's onChange callback automatically adds a "event.target.checked" value to the event
	 * which can be used instead.
	 */
	const handleCheckedChange = (event) =>
		setBookingArea({
			...bookingArea,
			[event.target.name]: event.target.checked,
		});

	/**
	 * We are adding a new function, the handleMeteorResponse(). Since handling Meteor.call() responses are pretty
	 * common, most of the handling code inside the callback function is repeated. To avoid repitition, we would
	 * ideally create a refactored method like this in a "utils" folder so that it can be used by all the components.
	 * But for simplicity, since we have only one component here, I will just leave the method here.
	 *
	 * Notice also we are using the useCallback() hook because we don't want React to re-create this function on each
	 * re-render.
	 */
	const handleMeteorResponse = useCallback(
		(error, action) => {
			if (error) {
				// We can further differentiate to display different errors here. We could also accept the
				// i18n message string identifier as a dynamic argument for this handler.
				enqueueSnackbar(i18n.__('common.error.something_went_wrong'), {
					variant: 'error',
				});

				return;
			}

			// We are accepting "action" argument to determine which success message to display.
			// This scenario can also be easily expanded, but in this particular case, we only have
			// two, "updated", and "added" actions.
			const message = i18n.__(`settings.tables.area.${action}`);

			// Enqueue success message.
			enqueueSnackbar(
				isAppActive(restaurant, 'reserveWithGoogle')
					? generateRwgSnackbarString(message)
					: message,
				{ variant: 'success' },
			);

			// Stop loading state.
			setBookingArea({ ...bookingArea, loading: false });

			// Close form dialog.
			onClose();
		},
		[enqueueSnackbar, onClose],
	);

	const handleSubmit = () => {
		// Set loading state
		setBookingArea({ ...bookingArea, loading: true });

		// Build area object doc from the state directly. If elements of the state are not used multiple times,
		// then extracting elements out of the state "bookingArea" is more work than using it directly.
		// Just a thought (preference).
		const doc = {
			name: bookingArea.name,
			bookable: bookingArea.bookable,
			bookableOnline: bookingArea.bookable && bookingArea.bookableOnline,
			bookingPriority: parseInt(bookingArea.bookingPriority),
			note: bookingArea.note,
			internalNote: bookingArea.internalNote,
		};

		/**
		 * We are going to avoid unnecessary nesting of if-else statements. If we can easily use linear, single if-statements
		 * followed by a "return" to prevent the JavaScript execution to proceed further, then that should be preferred for
		 * better code readability.
		 *
		 * In this particular example, you can see how we can get rid of the "else" block completely by simply adding a "return"
		 * statement at the end of the conditional blocks.
		 */

		// If area's database ID is already defined, then it must be an update.
		if (area && area._id) {
			// Update existing
			Meteor.call(
				'seatingAreas.update',
				restaurant._id,
				area._id,
				doc,
				(error) => handleMeteorResponse(error, 'updated'),
			);

			return;
		}

		// Otherwise, create a new seating area.
		Meteor.call('seatingAreas.insert', restaurant._id, doc, (error) =>
			handleMeteorResponse(error, 'added'),
		);
	};

	return (
		<Dialog
			open={!!open}
			onClose={onClose}
			className={classes.root}
			fullWidth
			maxWidth="md"
			fullScreen={fullScreen}
		>
			<ValidatorForm onSubmit={handleSubmit}>
				<DialogTitle
					id="form-dialog-title"
					className={classes.dialogTitle}
				>
					{area ? (
						<T>settings.tables.area.edit</T>
					) : (
						<T>settings.tables.area.add</T>
					)}
				</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					<Grid container spacing={5}>
						<Grid item xs={12} sm={7}>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<NameControl
										name={bookingArea.name}
										handleChange={handleChange}
										controlFor="area"
									/>
								</Grid>
								<Grid item xs={12}>
									<BookingPriorityControl
										bookingPriority={
											bookingArea.bookingPriority
										}
										isLoading={bookingArea.loading}
										handleChange={handleChange}
										controlFor="area"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextValidator
										label={i18n.__(
											'settings.tables.area.note',
										)}
										name="note"
										value={bookingArea.note}
										onChange={handleChange}
										fullWidth
										variant="filled"
										disabled={bookingArea.loading}
										autoComplete="off"
										multiline
										minRows="2"
										helperText={i18n.__(
											'settings.tables.area.note_help',
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<InternalNoteControl
										internalNote={bookingArea.internalNote}
										isLoading={bookingArea.loading}
										handleChange={handleChange}
										controlFor="area"
									/>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12} sm={5}>
							<BookableControl
								bookable={bookingArea.bookable}
								bookableOnline={bookingArea.bookableOnline}
								handleChange={handleCheckedChange}
								controlFor="area"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions className={classes.dialogActions}>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={bookingArea.loading}
						className={classes.submitButton}
					>
						<T>common.save</T>
					</Button>
					<Button onClick={onClose} disabled={bookingArea.loading}>
						<T>common.cancel</T>
					</Button>
					{bookingArea.loading && <Loading inline />}
				</DialogActions>
			</ValidatorForm>
		</Dialog>
	);
};

export default AreaForm;
