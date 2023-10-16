import { TextValidator } from 'react-material-ui-form-validator';
import { useTranslatedText } from './useTranslatedText';

const NameControl = ({ name, handleChange, controlFor }) => {
	/**
	 * Instead of passing down several texts to this component for Label, Helpers etc, we can use a single
	 * prop, "controlFor" to determine which Labels and Helper texts if any to display.
	 *
	 * The logic of determining display text by using the controlFor prop is refactored to the useTranslatedText()
	 * hook for reusability by other components.
	 */
	const texts = useTranslatedText(controlFor);

	return (
		<TextValidator
			label={i18n.__(texts.nameLabel)}
			name="name"
			value={name}
			onChange={handleChange}
			fullWidth
			variant="filled"
			validators={['required']}
			errorMessages={[i18n.__(texts.nameError)]}
			disabled={bookingArea.loading}
			autoComplete="off"
			helperText={i18n.__(texts.nameHelperText)}
			autoFocus
		/>
	);
};

export default NameControl;
