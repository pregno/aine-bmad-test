import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const MAX_LENGTH = 500;
const LABEL = 'What needs to be done?';
const EMPTY_ERROR = 'Task text is required';
const LENGTH_ERROR = 'Task text must be 500 characters or less';

export interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function AddTaskDialog({ open, onClose, onSubmit }: AddTaskDialogProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError(EMPTY_ERROR);
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError(LENGTH_ERROR);
      return;
    }
    setError(null);
    onSubmit(trimmed);
    reset();
    onClose();
  }, [text, onSubmit, onClose, reset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleSubmit, handleClose]
  );

  const helperText =
    error === LENGTH_ERROR ? `${LENGTH_ERROR} ${text.length}/${MAX_LENGTH}` : (error ?? undefined);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
      transitionDuration={0}
    >
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label={LABEL}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={helperText}
          data-testid="add-task-textfield"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} data-testid="add-task-cancel">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} data-testid="add-task-submit">
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
