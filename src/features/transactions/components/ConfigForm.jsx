import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@mui/material';
import FieldRenderer from './FieldRenderer';

export default function ConfigForm({
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  isEdit = false,
  submitLabel,
  onValuesChange,
}) {
  const { control, handleSubmit, register, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onBlur',
  });

  // Re-sync when defaultValues changes (edit record loaded late, order number regenerated)
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watched = watch();

  // Notify parent when a value changes (used for type-driven number regen)
  useEffect(() => {
    if (onValuesChange) onValuesChange(watched);
  }, [watched, onValuesChange]);

  const colSpan = (size) => {
    switch (size) {
      case 1: return 'md:col-span-1';
      case 2: return 'md:col-span-2';
      case 3: return 'md:col-span-3';
      default: return 'md:col-span-1';
    }
  };

  const visibleFields = useMemo(
    () => fields.filter((f) => !f.showIf || f.showIf(watched)),
    [fields, watched]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {visibleFields.map((field) => {
          const isDisabled =
            isEdit && typeof field.disabled === 'function'
              ? field.disabled(watched, { isEdit })
              : field.disabled;

          return (
            <div key={field.name} className={colSpan(field.size)}>
              <FieldRenderer
                field={field}
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
        <Button variant="text" onClick={onCancel}>Cancel</Button>
        <Button variant="contained" type="submit">
          {submitLabel || (isEdit ? 'Save Changes' : 'Create')}
        </Button>
      </div>
    </form>
  );
}