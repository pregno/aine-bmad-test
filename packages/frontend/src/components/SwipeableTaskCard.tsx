import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Task } from '@aine/shared';
import { TaskStatus } from '@aine/shared';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const SWIPE_THRESHOLD = 72; // px to trigger delete reveal
const SWIPE_MAX = 80; // max swipe distance in px (width of delete zone)

interface SwipeableTaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  fadeInOnMount?: boolean;
}

export function SwipeableTaskCard({
  task,
  onToggle,
  onDelete,
  fadeInOnMount = false,
}: SwipeableTaskCardProps) {
  const [swipeX, setSwipeX] = useState(0); // 0 to -SWIPE_MAX
  const [isRevealed, setIsRevealed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(fadeInOnMount);

  const startXRef = useRef(0);
  const isSwipingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const resetSwipeTimeoutRef = useRef<number | null>(null);
  const deleteTimeoutRef = useRef<number | null>(null);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const showDeleteButton = isRevealed || isHovered;

  useEffect(() => {
    if (!isFadingIn) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      setIsFadingIn(false);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [isFadingIn]);

  useEffect(() => {
    if (!isRevealed) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        setSwipeX(0);
        setIsRevealed(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isRevealed]);

  useEffect(() => {
    return () => {
      if (resetSwipeTimeoutRef.current !== null) {
        window.clearTimeout(resetSwipeTimeoutRef.current);
      }
      if (deleteTimeoutRef.current !== null) {
        window.clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0]!.clientX;
    isSwipingRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0]!.clientX - startXRef.current;
    if (deltaX < 0) {
      // Left swipe — reveal delete zone
      isSwipingRef.current = true;
      setSwipeX(Math.max(deltaX, -SWIPE_MAX));
    } else if (isRevealed && deltaX > 0) {
      // Right swipe while revealed — close delete zone
      isSwipingRef.current = true;
      setSwipeX(Math.min(-SWIPE_MAX + deltaX, 0));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (-swipeX >= SWIPE_THRESHOLD) {
      setSwipeX(-SWIPE_MAX);
      setIsRevealed(true);
    } else {
      setSwipeX(0);
      setIsRevealed(false);
    }
    // Reset swiping flag after a tick to prevent accidental click
    resetSwipeTimeoutRef.current = window.setTimeout(() => {
      isSwipingRef.current = false;
    }, 0);
  };

  const handleCardClick = () => {
    if (isSwipingRef.current || isRevealed) {
      // Tap elsewhere while revealed — close swipe
      if (isRevealed) {
        setSwipeX(0);
        setIsRevealed(false);
      }
      return;
    }
    onToggle(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click (toggle)
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSwipeX(0);
    setIsRevealed(false);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    setIsExiting(true);
    // Give animation time to complete before calling onDelete
    deleteTimeoutRef.current = window.setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <Box
      ref={rootRef}
      sx={{ position: 'relative', mb: 1, overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red delete zone behind card — visible when swiped */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: SWIPE_MAX,
          bgcolor: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
        }}
      >
        <DeleteIcon sx={{ color: 'white' }} />
      </Box>

      {/* Task card (sits on top of delete zone) */}
      <Card
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        sx={{
          minHeight: 48,
          cursor: 'pointer',
          position: 'relative',
          transform: isExiting ? 'translateX(-110%)' : `translateX(${swipeX}px)`,
          opacity: isExiting ? 0 : isFadingIn ? 0 : isCompleted ? 0.7 : 1,
          transition: isDragging
            ? 'none' // no transition while finger is dragging — responsive
            : 'transform 250ms ease, opacity 250ms ease',
        }}
      >
        <CardContent
          sx={{
            py: 1.5,
            '&:last-child': { pb: 1.5 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isCompleted && (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={isCompleted ? { textDecoration: 'line-through', color: 'text.secondary' } : {}}
            >
              {task.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(task.createdAt)}
            </Typography>
          </Box>

          {/* Delete button — always rendered, visible on hover (desktop) or swipe reveal */}
          <IconButton
            aria-label="delete task"
            data-testid={`delete-task-${task.id}`}
            onClick={handleDeleteClick}
            size="small"
            sx={{
              color: 'error.main',
              opacity: showDeleteButton ? 1 : 0,
              transition: 'opacity 150ms ease',
              pointerEvents: showDeleteButton ? 'auto' : 'none',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText>Delete this task? This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} data-testid="delete-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            data-testid="delete-confirm"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
