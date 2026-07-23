import React, { useState } from 'react';
import { motion, useMotionValue, PanInfo } from 'motion/react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface SwipeableReminderCardProps {
  onDelete: () => void;
  onEdit?: () => void;
  onDone: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const SwipeableReminderCard: React.FC<SwipeableReminderCardProps> = ({
  onDelete,
  onEdit,
  onDone,
  isOpen,
  onOpenChange,
  children,
}) => {
  const { language } = useApp();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const x = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      // Swipe right - open actions
      onOpenChange(true);
    } else if (info.offset.x < -10) {
      // Swipe left - close actions
      onOpenChange(false);
    } else {
      // Snap back
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDone = () => {
    onOpenChange(false);
    onDone();
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <div className="relative overflow-visible rounded-xl">
        {/* Action Buttons Background */}
        <div className="absolute inset-y-0 left-0 flex items-center gap-2 px-2">
          <button
            onClick={handleDone}
            className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center rounded-xl transition-transform active:scale-95"
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
          {onEdit && (
            <button
              onClick={() => { onOpenChange(false); onEdit(); }}
              className="h-12 w-12 bg-secondary text-secondary-foreground flex items-center justify-center rounded-xl transition-transform active:scale-95"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="h-12 w-12 bg-destructive text-destructive-foreground flex items-center justify-center rounded-xl transition-transform active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Swipeable Card Content */}
        <motion.div
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: onEdit ? 180 : 120 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          animate={{ x: isOpen ? (onEdit ? 180 : 120) : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 touch-pan-y"
        >
          {children}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fa' ? 'حذف یادآور؟' : 'Delete reminder?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fa' 
                ? 'این یادآور به طور دائم حذف خواهد شد.'
                : 'This reminder will be permanently removed.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'fa' ? 'لغو' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'fa' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};