'use client';

import {useStatsigClient} from '@statsig/react-bindings';
import {useState, useEffect} from 'react';

import {LinkButton} from '@code-dot-org/component-library/button';
import {
  Heading2,
  Heading3,
  BodyTwoText,
  BodyThreeText,
  OverlineThreeText,
} from '@code-dot-org/component-library/typography';

import AFEForm from '@/components/afeEligibility/AFEForm';
import AFESchoolCheck from '@/components/afeEligibility/AFESchoolCheck';
import Link from '@/components/link';
import {getStudioUrl} from '@/config/studio';

import styles from './afeEligibility.module.scss';

const SESSION_STORAGE_KEY = 'afeEligibilityData';

type AFEEligibilityData = {
  email?: string;
  userType?: string;
  schoolId?: string;
  schoolName?: string;
  isEligible?: boolean;
  isSignedIn?: boolean;
};

const AFEEligibility: React.FC = () => {
  const {logEvent} = useStatsigClient();

  const getSessionEligibilityData = () =>
    typeof sessionStorage === 'undefined'
      ? {}
      : JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}');

  const [eligibilityData, setEligibilityData] = useState<AFEEligibilityData>({
    email: '',
    userType: '',
    schoolId: '',
    schoolName: '',
    isEligible: false,
    isSignedIn: false,
    ...getSessionEligibilityData(),
  });

  const updateEligibilityData = (newEligibilityData: AFEEligibilityData) =>
    setEligibilityData(oldEligibilityData => ({
      ...oldEligibilityData,
      ...newEligibilityData,
    }));

  useEffect(() => {
    logEvent('AFE Start');

    fetch(
      getStudioUrl('/dashboardapi/v1/users/me/donor_teacher_banner_details'),
      {
        credentials: 'include',
      },
    )
      .then(response => (response.ok ? response.json() : null))
      .then(accountData => {
        const newEligibilityData: AFEEligibilityData = {
          userType: accountData?.user_type || '',
          isSignedIn: !!accountData,
        };

        if (!eligibilityData.email) {
          newEligibilityData.email = accountData?.teacher_email || '';
        }

        if (!eligibilityData.schoolId) {
          newEligibilityData.schoolId = accountData?.nces_school_id || '';
          newEligibilityData.schoolName = accountData?.school_name || '';
          newEligibilityData.isEligible = accountData?.afe_high_needs || false;
        }

        updateEligibilityData(newEligibilityData);
      });
  }, []);

  useEffect(() => {
    sessionStorage?.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(eligibilityData),
    );
  }, [eligibilityData]);

  if (eligibilityData.userType === 'student') {
    return (
      <>
        <Heading2>You need a Code.org teacher account</Heading2>

        <BodyTwoText>
          You're currently signed in to Code.org with a student account.
        </BodyTwoText>

        <BodyTwoText>
          You'll need to sign in with a teacher account to apply to receive
          Amazon Future Engineer benefits. You can use the button below to sign
          out, then return to{' '}
          <Link
            removeMarginBottom
            isLinkExternal={false}
            size="m"
            href={location.href}
          >
            {location.hostname}
            {location.pathname}
          </Link>{' '}
          to continue.
        </BodyTwoText>

        <LinkButton href={getStudioUrl('/users/sign_out')} text="Sign out" />
      </>
    );
  } else {
    return (
      <div className={styles.afeEligibility}>
        <aside className={styles.afeEligibilityFormContainer}>
          {eligibilityData.isEligible &&
          eligibilityData.email &&
          eligibilityData.schoolId &&
          eligibilityData.schoolName ? (
            <AFEForm
              email={eligibilityData.email}
              schoolId={eligibilityData.schoolId}
              schoolName={eligibilityData.schoolName}
              isSignedIn={eligibilityData.isSignedIn}
              onEligibilityReset={() =>
                updateEligibilityData({isEligible: false})
              }
            />
          ) : (
            <AFESchoolCheck
              email={eligibilityData.email}
              onComplete={updateEligibilityData}
            />
          )}
        </aside>

        <aside className={styles.afeEligibilityReqsContainer}>
          <Heading3 visualAppearance="heading-sm">
            School Eligibility Requirements*
          </Heading3>

          <BodyThreeText>
            Title 1 and/or {'>'} 40% Free/Reduced Lunch (FRL) student enrollment
          </BodyThreeText>

          <div className={styles.afeEligibilityDivider} role="separator">
            <OverlineThreeText>or</OverlineThreeText>
          </div>

          <BodyThreeText>
            {'>'}30% Black/Latino/Native American (BLNA) student enrollment
          </BodyThreeText>

          <div className={styles.afeEligibilityDivider} role="separator">
            <OverlineThreeText>or</OverlineThreeText>
          </div>

          <BodyThreeText>Rural school</BodyThreeText>

          <BodyThreeText className={styles.afeEligibilityInfoText}>
            *Eligibility requirements verified using{' '}
            <Link
              isLinkExternal
              removeMarginBottom
              size="s"
              href="https://nces.ed.gov/ccd/schoolsearch"
            >
              NCES data
            </Link>
          </BodyThreeText>
        </aside>
      </div>
    );
  }
};

export default AFEEligibility;
