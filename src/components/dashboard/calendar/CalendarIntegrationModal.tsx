import React from 'react';
import { ExternalCalendarModal } from './ExternalCalendarModal';

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarIntegrationModal: React.FC<CalendarIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <ExternalCalendarModal
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
