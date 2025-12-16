'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pin, PinOff, Eye, EyeOff, Lock, Unlock, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Thread {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;
  hidden_reason: string | null;
}

interface ThreadActionsProps {
  thread: Thread;
}

export function ThreadActions({ thread }: ThreadActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [editTitle, setEditTitle] = useState(thread.title);
  const [editContent, setEditContent] = useState(thread.content);

  const updateThread = async (updates: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/community/threads/${thread.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteThread = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/community/threads/${thread.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleHide = () => {
    updateThread({ 
      is_hidden: true, 
      hidden_reason: hideReason 
    });
    setShowHideDialog(false);
  };

  const handleEdit = () => {
    updateThread({ 
      title: editTitle, 
      content: editContent 
    });
    setShowEditDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thread Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Thread
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => updateThread({ is_pinned: !thread.is_pinned })}>
            {thread.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Thread
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Thread
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => updateThread({ is_locked: !thread.is_locked })}>
            {thread.is_locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Thread
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Lock Thread
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {thread.is_hidden ? (
            <DropdownMenuItem 
              onClick={() => updateThread({ is_hidden: false, hidden_reason: null })}
              className="text-green-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Thread
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowHideDialog(true)}
              className="text-orange-600"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Thread
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Thread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hide Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide Thread</DialogTitle>
            <DialogDescription>
              This will hide the thread from the community. You can unhide it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Why is this thread being hidden?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHideDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleHide} disabled={isLoading}>
              {isLoading ? 'Hiding...' : 'Hide Thread'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Thread</DialogTitle>
            <DialogDescription>
              Make changes to the thread. This will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Thread</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the thread and all its replies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteThread} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
