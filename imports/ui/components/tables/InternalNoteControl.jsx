import { TextValidator } from 'react-material-ui-form-validator';
import { useTranslatedText } from './useTranslatedText';

const InternalNoteControl = ({
	internalNote,
	isLoading,
	handleChange,
	controlFor,
}) => {
	const texts = useTranslatedText(controlFor);

	return (
		<TextValidator
			label={i18n.__(texts.internalNoteLabel)}
			name="internalNote"
			value={internalNote}
			onChange={handleChange}
			fullWidth
			variant="filled"
			disabled={isLoading}
			autoComplete="off"
			multiline
			minRows="2"
			helperText={i18n.__(texts.internalNoteHelperText)}
		/>
	);
};

export default InternalNoteControl;
