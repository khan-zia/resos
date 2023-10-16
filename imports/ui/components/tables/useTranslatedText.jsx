import { useEffect, useState } from 'react';

/**
 * This hook helps avoid repeated use of the exact same logic to determine which internationalized version of text
 * should be displayed by components. The following components are used by more than one input form i.e. when adding
 * a new seating area and when adding a new table to a seating area.
 *
 * - NameControl.jsx
 * - BookingPriorityControl.jsx
 * - InternalNoteControl.jsx
 * - BookableControl.jsx
 *
 * Each one of the above components accepts a "controlFor" prop which determines whether the component is being used
 * for adding new Area or adding new Table. For each case, different labels and helper texts are required that are also
 * translated using the i18n lib.
 *
 * This hook accepts the "controlFor" prop and determines a set of predefined values for displayable texts.
 */
export const useTranslatedText = ({ controlFor }) => {
	const [texts, setTexts] = useState({
		nameLabel: '',
		nameHelperText: '',
		nameError: '',
		bookingPriorityLabel: '',
		bookingPriorityHelperText: '',
		internalNoteLabel: '',
		internalNoteHelperText: '',
		bookableLabel: '',
		bookableOnlineLabel: '',
		bookableHelp: '',
		bookableOnlineHelp: '',
	});

	useEffect(() => {
		if (controlFor === 'area') {
			setTexts({
				nameLabel: 'settings.tables.area.name',
				nameHelperText: 'settings.tables.area.name_help',
				nameError: 'common.error.required',
				bookingPriorityLabel: 'settings.tables.area.priority',
				bookingPriorityHelperText: 'settings.tables.area.priority_help',
				internalNoteLabel: 'settings.tables.area.internal_note',
				internalNoteHelperText:
					'settings.tables.area.internal_note_help',
				bookableLabel: 'settings.tables.area.bookable',
				bookableOnlineLabel: 'settings.tables.area.bookable_online',
				bookableHelp: 'settings.tables.area.bookable_help',
				bookableOnlineHelp: 'settings.tables.area.bookable_online_help',
			});

			return;
		}

		// I will guess i18n strings for "table".
		// I simply removed the ".area" from the notation. To be changed accordingly otherwise.
		if (controlFor === 'table') {
			setTexts({
				nameLabel: 'settings.tables.name',
				nameHelperText: 'settings.tables.name_help',
				nameError: 'common.error.required',
				bookingPriorityLabel: 'settings.tables.priority',
				bookingPriorityHelperText: 'settings.tables.priority_help',
				internalNoteLabel: 'settings.tables.internal_note',
				internalNoteHelperText: 'settings.tables.internal_note_help',
				bookableLabel: 'settings.tables.bookable',
				bookableOnlineLabel: 'settings.tables.bookable_online',
				bookableHelp: 'settings.tables.bookable_help',
				bookableOnlineHelp: 'settings.tables.bookable_online_help',
			});

			return;
		}
	}, [controlFor]);

	return texts;
};
