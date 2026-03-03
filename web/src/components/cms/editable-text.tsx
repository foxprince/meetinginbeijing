'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InlineEditButton } from './inline-edit-button';
import { useAdminSession } from '@/hooks/use-admin-session';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  wrapperClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function EditableText({
  value,
  onSave,
  multiline = false,
  className = '',
  wrapperClassName = '',
  as = 'span',
}: EditableTextProps) {
  const isAdmin = useAdminSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isAdmin) {
    const Tag = as;
    return <Tag className={className}>{value}</Tag>;
  }

  if (isEditing) {
    return (
      <div className={`space-y-2 ${wrapperClassName}`}>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={className}
            rows={4}
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={className}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
            取消
          </Button>
        </div>
      </div>
    );
  }

  const Tag = as;
  return (
    <div className={`group inline-flex items-center ${wrapperClassName}`}>
      <Tag className={className}>{value}</Tag>
      <InlineEditButton onClick={() => setIsEditing(true)} />
    </div>
  );
}
