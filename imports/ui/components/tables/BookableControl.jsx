import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FormHelperText from '@material-ui/core/FormHelperText';
import { useTranslatedText } from './useTranslatedText';

const T = i18n.createComponent();

const BookableControl = ({
	bookable,
	bookableOnline,
	handleChange,
	controlFor,
}) => {
	/**
	 * Instead of passing down several texts to this component for Label, Helpers etc, we can use a single
	 * prop, "controlFor" to determine which Labels and Helper texts to display.
	 *
	 * The logic of determining display text by using the controlFor prop is refactored to the useTranslatedText()
	 * hook for reusability by other components.
	 */
	const texts = useTranslatedText(controlFor);

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				<FormControlLabel
					control={
						<Switch
							checked={bookable}
							onChange={handleChange}
							name="bookable"
							color="primary"
						/>
					}
					label={i18n.__(texts.bookableLabel)}
				/>
				<FormHelperText>
					<T>{texts.bookableHelp}</T>
				</FormHelperText>
			</Grid>
			<Grid item xs={12}>
				<FormControlLabel
					control={
						<Switch
							checked={bookable && bookableOnline}
							onChange={handleChange}
							name="bookableOnline"
							color="primary"
						/>
					}
					label={i18n.__(texts.bookableOnlineLabel)}
				/>
				<FormHelperText>
					<T>{texts.bookableOnlineHelp}</T>
				</FormHelperText>
			</Grid>
		</Grid>
	);
};

export default BookableControl;
