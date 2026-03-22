import { withTheme } from '@rjsf/core';
import {
  type FieldTemplateProps,
  getSubmitButtonOptions,
  type RegistryWidgetsType,
  type TemplatesType,
  type WidgetProps,
} from '@rjsf/utils';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Slider } from './slider';

const FieldTemplate = ({
  id,
  classNames,
  label,
  description,
  errors,
  children,
  displayLabel,
  hidden,
}: FieldTemplateProps) => {
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <Field className={cn(classNames, 'mb-3')}>
      {displayLabel && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {children}
      {displayLabel && description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
      <FieldError>{errors}</FieldError>
    </Field>
  );
};

const TextWidget = ({
  id,
  placeholder,
  required,
  readonly,
  disabled,
  type,
  value,
  onChange,
  onBlur,
  onFocus,
  options,
}: WidgetProps) => {
  const _onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    return onChange(value === '' ? options.emptyValue : value);
  };

  return (
    <Input
      id={id}
      type={type || 'text'}
      placeholder={placeholder}
      value={value ?? ''}
      required={required}
      disabled={disabled || readonly}
      onChange={_onChange}
      onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
      onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
    />
  );
};

const SelectWidget = ({
  id,
  options,
  value,
  required,
  disabled,
  readonly,
  onChange,
  placeholder,
}: WidgetProps) => {
  const { enumOptions } = options;

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(v) => onChange(v)}
      disabled={disabled || readonly}
      required={required}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder || 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {enumOptions?.map((option, index) => (
          <SelectItem key={index} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const SliderWidget = ({
  defaultValue = 0,
  value,
  disabled,
  readonly,
  onChange,
  schema,
}: WidgetProps) => {
  const currentValue = value ?? +(defaultValue ?? 0);

  return (
    <div className="flex items-center gap-2">
      <Slider
        max={schema.maximum}
        min={schema.minimum}
        step={schema.multipleOf || 1}
        onValueChange={(v) => onChange(v[0])}
        disabled={disabled || readonly}
        value={[currentValue]}
      />
      <span className="text-xs font-mono font-medium leading-none px-1.5 py-0.5 rounded bg-secondary">
        {currentValue}
      </span>
    </div>
  );
};

/**
 * Custom Submit Button Template using Shadcn Button.
 */
const SubmitButton = ({ uiSchema }: any) => {
  const {
    submitText,
    norender,
    props: submitButtonProps = {},
  } = getSubmitButtonOptions(uiSchema);

  if (norender) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-end">
      <Button type="submit" {...submitButtonProps}>
        {submitText}
      </Button>
    </div>
  );
};

const widgets: RegistryWidgetsType = {
  TextWidget,
  SelectWidget,
  SliderWidget,
  EmailWidget: TextWidget,
  PasswordWidget: TextWidget,
  URLWidget: TextWidget,
};

const templates: Partial<TemplatesType> = {
  FieldTemplate,
  ButtonTemplates: {
    SubmitButton,
  } as any,
};

export const Rjsf = withTheme({
  widgets,
  templates,
});
