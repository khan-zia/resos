import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FilledInput from '@material-ui/core/FilledInput';
import { useTranslatedText } from './useTranslatedText';

const T = i18n.createComponent();

const BookingPriorityControl = ({
	bookingPriority,
	isLoading,
	handleChange,
	controlFor,
}) => {
	/**
	 * Instead of passing down several texts to this component for Label, Helpers etc, we can use a single
	 * prop, "controlFor" to determine which Labels and Helper texts if any to display.
	 *
	 * The logic of determining display text by using the controlFor prop is refactored to the useTranslatedText()
	 * hook for reusability by other components.
	 */
	const texts = useTranslatedText(controlFor);

	return (
		<FormControl variant="filled" fullWidth>
			<InputLabel htmlFor="bookingPriority">
				<T>{texts.bookingPriorityLabel}</T>
			</InputLabel>
			<Select
				value={bookingPriority}
				onChange={handleChange}
				disabled={isLoading}
				input={
					<FilledInput name="bookingPriority" id="bookingPriority" />
				}
			>
				<MenuItem value="10">
					10 -&nbsp;<T>common.high</T>
				</MenuItem>
				<MenuItem value="9">9</MenuItem>
				<MenuItem value="8">8</MenuItem>
				<MenuItem value="7">7</MenuItem>
				<MenuItem value="6">6</MenuItem>
				<MenuItem value="5">
					5 -&nbsp;
					<T>common.medium</T>
				</MenuItem>
				<MenuItem value="4">4</MenuItem>
				<MenuItem value="3">3</MenuItem>
				<MenuItem value="2">2</MenuItem>
				<MenuItem value="1">
					1 -&nbsp;<T>common.low</T>
				</MenuItem>
			</Select>
			<FormHelperText>
				<T>{texts.bookingPriorityHelperText}</T>
			</FormHelperText>
		</FormControl>
	);
};

export default BookingPriorityControl;
