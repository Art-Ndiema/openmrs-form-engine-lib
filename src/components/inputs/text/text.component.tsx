import React, { useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash-es/isEmpty';
import { useTranslation } from 'react-i18next';
import { Layer, TextInput } from '@carbon/react';
import { useField } from 'formik';
import { type FormFieldProps } from '../../../types';
import { FormContext } from '../../../form-context';
import { isTrue } from '../../../utils/boolean-utils';
import { isInlineView } from '../../../utils/form-helper';
import FieldValueView from '../../value/view/field-value-view.component';
import RequiredFieldLabel from '../../required-field-label/required-field-label.component';
import styles from './text.scss';
import { useFieldValidationResults } from '../../../hooks/useFieldValidationResults';
import TooltipFieldLabel from '../../tooltip-field-label/tooltip-field-label.component';


const TextField: React.FC<FormFieldProps> = ({ question, onChange, handler, previousValue }) => {
  const { t } = useTranslation();
  const [field] = useField(question.id);
  const { setFieldValue, encounterContext, layoutType, workspaceLayout } = React.useContext(FormContext);
  const { errors, warnings, setErrors, setWarnings } = useFieldValidationResults(question);
  const [lastBlurredValue, setLastBlurredValue] = useState(field.value);

  useEffect(() => {
    if (!isEmpty(previousValue)) {
      setFieldValue(question.id, previousValue);
      field['value'] = previousValue;
      field.onBlur(null);
    }
  }, [previousValue]);

  field.onBlur = (event) => {
    if (field.value && question.unspecified) {
      setFieldValue(`${question.id}-unspecified`, false);
    }
    if (previousValue !== field.value && lastBlurredValue !== field.value) {
      setLastBlurredValue(field.value);
      onChange(question.id, field.value, setErrors, setWarnings);
      handler?.handleFieldSubmission(question, field.value, encounterContext);
    }
  };

  const isInline = useMemo(() => {
    if (['view', 'embedded-view'].includes(encounterContext.sessionMode) || isTrue(question.readonly)) {
      return isInlineView(question.inlineRendering, layoutType, workspaceLayout, encounterContext.sessionMode);
    }
    return false;
  }, [encounterContext.sessionMode, question.readonly, question.inlineRendering, layoutType, workspaceLayout]);

  return encounterContext.sessionMode == 'view' || encounterContext.sessionMode == 'embedded-view' ? (
    <FieldValueView
      label={t(question.label)}
      value={field.value}
      conceptName={question.meta?.concept?.display}
      isInline={isInline}
    />
  ) : (
    !question.isHidden && (
      <>
        <div className={styles.boldedLabel}>
          <Layer>
            <TextInput
              {...field}
              id={question.id}
              labelText={
                question.isRequired ? (
                  <RequiredFieldLabel label={t(question.label)} />) : <><TooltipFieldLabel label={t(question.label)} field={question} /></>
              }
              name={question.id}
              value={field.value || ''}
              disabled={question.isDisabled}
              readOnly={Boolean(question.readonly)}
              invalid={errors.length > 0}
              invalidText={errors[0]?.message}
              warn={warnings.length > 0}
              warnText={warnings.length && warnings[0].message}
              maxLength={question.questionOptions.max || TextInput.maxLength}
            />
          </Layer>
        </div>
      </>
    )
  );
};

export default TextField;
