'use client';

import {useStatsigClient} from '@statsig/react-bindings';
import {useCallback, useState, useEffect} from 'react';

import Button, {LinkButton} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {
  Heading2,
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import {getStudioUrl} from '@/config/studio';

import styles from './afeEligibility.module.scss';

const SUPPORT_EMAIL = 'support@code.org';
const REQUIREMENTS_ID = 'afe-requirements';
const ZIP_REGEX = new RegExp(/(?!00000)\d{5}/);
const NO_SCHOOL_ID = '-1';

type School = {
  nces_id: string;
  name: string;
};

type AFESchoolCheckFromData = {
  email: string;
  zipCode: string;
  schoolId: string;
};

type AFESchoolCheckResult = {
  isEligible: boolean;
  email: string;
  schoolId: string;
  schoolName?: string;
};

interface AFESchoolCheckProps {
  email?: string;
  onComplete: (result: AFESchoolCheckResult) => void;
}

const AFESchoolCheck: React.FC<AFESchoolCheckProps> = ({
  email = '',
  onComplete,
}) => {
  const {logEvent} = useStatsigClient();
  const [showIneligibleNotice, setShowIneligibleNotice] = useState(false);
  const [areSchoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState<
    SimpleDropdownProps['items']
  >([]);
  const [isFormSubmitted, setFormSubmission] = useState(false);
  const [formData, setFormData] = useState<AFESchoolCheckFromData>({
    email,
    zipCode: '',
    schoolId: '',
  });
  const [formError, setFormError] = useState('');

  const updateFormData = (newFormData: object) => {
    setFormData(oldFormData => ({
      ...oldFormData,
      ...newFormData,
    }));
    setFormError('');
  };

  const resetSchoolData = () => {
    setSchoolOptions([]);
    updateFormData({schoolId: ''});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value} = e.target;
    updateFormData({[name]: value});
  };

  const handleComplete = useCallback(
    (isEligible: boolean) =>
      onComplete({
        isEligible,
        email: formData.email,
        schoolId: formData.schoolId,
        schoolName: schoolOptions?.find(
          option => option.value === formData.schoolId,
        )?.text,
      }),
    [onComplete, formData, schoolOptions],
  );

  const handleEligibility = (isEligible: boolean) => {
    if (isEligible) {
      handleComplete(true);
    } else {
      logEvent('AFE Ineligible');
      setShowIneligibleNotice(true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Let the browser show validation messages
    if (!e.currentTarget.checkValidity()) return;

    logEvent('AFE Submit School Info');

    if (formData.schoolId === NO_SCHOOL_ID) {
      handleEligibility(false);
    } else if (formData.schoolId) {
      setFormSubmission(true);

      fetch(
        getStudioUrl(
          `/dashboardapi/v1/schools/${formData.schoolId}/afe_high_needs`,
        ),
      )
        .then(async response => {
          if (response.ok) {
            return await response.json();
          } else {
            const errorText = await response.text();
            throw new Error(
              `Schools search failed with HTTP ${response.status} ${response.statusText}: ${errorText}`,
            );
          }
        })
        .then(schoolData => {
          handleEligibility(schoolData.afe_high_needs);
        })
        .catch(error => {
          setFormError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
        })
        .finally(() => {
          setFormSubmission(false);
        });
    }
  };

  useEffect(() => {
    updateFormData({email});
  }, [email]);

  useEffect(() => {
    if (formData.zipCode && ZIP_REGEX.test(formData.zipCode)) {
      setSchoolsLoading(true);

      fetch(
        getStudioUrl(`/dashboardapi/v1/schoolzipsearch/${formData.zipCode}`),
      )
        .then(async response => {
          if (response.ok) {
            return await response.json();
          } else {
            const errorText = await response.text();
            throw new Error(
              `Schools search failed with HTTP ${response.status} ${response.statusText}: ${errorText}`,
            );
          }
        })
        .then(schools => {
          const schoolItems: SimpleDropdownProps['items'] = [
            {value: NO_SCHOOL_ID, text: 'Other school not listed below'},
          ];
          schools.forEach(({nces_id, name}: School) =>
            schoolItems.push({value: nces_id, text: name}),
          );
          setSchoolOptions(schoolItems);
          updateFormData({schoolId: NO_SCHOOL_ID});
        })
        .catch(error => {
          resetSchoolData();
          setFormError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
        })
        .finally(() => {
          setSchoolsLoading(false);
        });
    } else {
      resetSchoolData();
    }
  }, [formData.zipCode]);

  return (
    <>
      <Heading2>Am I eligible?</Heading2>

      <BodyThreeText>
        Enter your teacher email address and select your school below to find
        out if you're eligible to participate in the Amazon Future Engineer
        program, which offers free support for participating Code.org
        classrooms.
      </BodyThreeText>

      <form onSubmit={handleSubmit}>
        <TextField
          required
          inputType="email"
          name="email"
          label="Email"
          className={styles.afeEligibilityFormField}
          value={formData.email}
          onChange={handleChange}
        />

        <TextField
          required
          inputType="text"
          name="zipCode"
          label="Enter your school's zip code"
          className={styles.afeEligibilityFormField}
          pattern={ZIP_REGEX.source}
          value={formData.zipCode}
          onChange={handleChange}
        />

        <SimpleDropdown
          required
          name="schoolId"
          labelText="Select your school from the list"
          className={styles.afeEligibilityFormField}
          value={formData.schoolId}
          onChange={handleChange}
          readOnly={!schoolOptions?.length}
          items={schoolOptions}
          iconLeft={
            areSchoolsLoading
              ? {iconName: 'spinner', animationType: 'spin'}
              : undefined
          }
        />

        {formError && (
          <BodyThreeText className={styles.afeEligibilityErrorText}>
            {formError}
          </BodyThreeText>
        )}

        <Button
          buttonTagTypeAttribute="submit"
          text="Find out if I'm eligible"
          isPending={isFormSubmitted}
          disabled={!!formError}
          onClick={() => {}}
        />
      </form>

      {showIneligibleNotice && (
        <CustomDialog
          className={styles.afeEligibilityNotice}
          aria-labelledby="afe-ineligible-notice-header"
          onClose={() => {
            setShowIneligibleNotice(false);
            handleComplete(false);
          }}
        >
          <Heading2 id="afe-ineligible-notice-header">
            We've checked your eligibility
          </Heading2>

          <BodyThreeText id="dsco-dialog-description">
            Your school does not meet the eligibility{' '}
            <Link
              size="s"
              href={`#${REQUIREMENTS_ID}`}
              aria-describedby={REQUIREMENTS_ID}
            >
              requirements*
            </Link>{' '}
            for the Amazon Future Engineer benefits, but you can still take
            advantage of all Code.org has to offer, including our robust
            curriculum and professional learning opportunities.
          </BodyThreeText>

          <BodyThreeText>
            If you think you received this message in error, contact us at{' '}
            <Link size="s" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </Link>
          </BodyThreeText>

          <LinkButton
            href="/teach"
            text="Start teaching with Code.org"
            className={styles.afeEligibilityNoticeLink}
          />

          <BodyFourText
            id={REQUIREMENTS_ID}
            className={styles.afeEligibilityInfoText}
          >
            *To participate in the Amazon Future Engineer program, a school must
            have Title 1 status OR have student enrollment of more than 40%
            underrepresented minority students and/or 40% students who qualify
            for free or reduced lunch.
          </BodyFourText>
        </CustomDialog>
      )}
    </>
  );
};

export default AFESchoolCheck;
