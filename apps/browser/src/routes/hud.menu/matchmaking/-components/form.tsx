import type { UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type { ComponentProps } from 'react';
import { Rjsf } from '@/components/ui/rjsf';

type FormProps = Omit<ComponentProps<typeof Rjsf>, 'validator'>;

const createUiSchema: UiSchema = {
  maxPlayers: {
    'ui:widget': 'SliderWidget',
  },
  laps: {
    'ui:widget': 'SliderWidget',
  },
  combat: {
    'ui:widget': 'SwitchWidget',
  },
  healing: {
    'ui:widget': 'SwitchWidget',
  },
  forceFPP: {
    'ui:widget': 'SwitchWidget',
  },
  freeWeapons: {
    'ui:widget': 'SwitchWidget',
  },
};

export const CreateMatchForm = ({
  schema,
  uiSchema = {},
  ...props
}: FormProps) => {
  return (
    <Rjsf
      {...props}
      showErrorList={false}
      uiSchema={{ ...uiSchema, ...createUiSchema }}
      schema={schema}
      validator={validator}
    />
  );
};

const joinUiSchema: UiSchema = {};

export const JoinMatchForm = ({
  schema,
  uiSchema = {},
  ...props
}: FormProps) => {
  return (
    <Rjsf
      {...props}
      showErrorList={false}
      uiSchema={{ ...uiSchema, ...joinUiSchema }}
      schema={schema}
      validator={validator}
    />
  );
};
