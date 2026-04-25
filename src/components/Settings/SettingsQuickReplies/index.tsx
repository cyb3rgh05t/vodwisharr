import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import globalMessages from '@app/i18n/globalMessages';
import type { QuickReplySetting } from '@server/lib/settings';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';

const messages = defineMessages({
  quickReplies: 'Quick Replies',
  quickRepliesSettings: 'Quick Reply Settings',
  quickRepliesDescription:
    'Customize the predefined issue comment templates used in the issue detail view.',
  apiUnavailable:
    'Quick Replies API is not available on this server build. Please update/redeploy backend.',
  label: 'Label',
  message: 'Message',
  toastSettingsSuccess: 'Quick replies saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving quick replies.',
  resetToDefaults: 'Reset to Defaults',
  resetAndSave: 'Reset + Save',
  replyFixedLabel: 'Issue Resolved',
  replyFixedMessage:
    'The reported issue has been resolved. Please check if everything works as expected. If the problem persists, please open a new issue.\n\n!! Tip: Update Playlist !!',
  replyInvestigatingLabel: 'Investigating',
  replyInvestigatingMessage:
    'Thank you for the report. We are investigating the issue and will get back to you as soon as we have more information.\n\n!! Tip: Update Playlist !!',
  replyMoreInfoLabel: 'More Information Needed',
  replyMoreInfoMessage:
    'Could you please provide more details about the issue? For example: What device/app are you using? When does the problem occur?\n\n!! Tip: Update Playlist !!',
  replyKnownIssueLabel: 'Known Issue',
  replyKnownIssueMessage:
    'This is a known issue that is already being worked on. We will let you know once it has been resolved.\n\n!! Tip: Update Playlist !!',
  replyNotReproducibleLabel: 'Cannot Reproduce',
  replyNotReproducibleMessage:
    'We were unable to reproduce the reported issue. Please check if the problem still persists and report back with more details.\n\n!! Tip: Update Playlist !!',
  replyNewlyAddedLabel: 'Newly Added',
  replyNewlyAddedMessage:
    'The content has been newly added and should be available shortly. Please be patient.\n\n!! Tip: Update Playlist !!',
  replyDuplicateLabel: 'Duplicate',
  replyDuplicateMessage:
    'This issue has already been reported in another issue. We are closing this one as a duplicate.\n\n!! Tip: Update Playlist !!',
});

type QuickRepliesFormValues = {
  quickReplies: QuickReplySetting[];
};

const SettingsQuickReplies = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<QuickReplySetting[]>('/api/v1/settings/quick-replies', {
    shouldRetryOnError: false,
  });

  const isQuickRepliesRouteMissing =
    axios.isAxiosError(error) && error.response?.status === 404;

  const defaultQuickReplies: QuickReplySetting[] = [
    {
      id: 'fixed',
      label: intl.formatMessage(messages.replyFixedLabel),
      message: intl.formatMessage(messages.replyFixedMessage),
    },
    {
      id: 'investigating',
      label: intl.formatMessage(messages.replyInvestigatingLabel),
      message: intl.formatMessage(messages.replyInvestigatingMessage),
    },
    {
      id: 'moreInfo',
      label: intl.formatMessage(messages.replyMoreInfoLabel),
      message: intl.formatMessage(messages.replyMoreInfoMessage),
    },
    {
      id: 'knownIssue',
      label: intl.formatMessage(messages.replyKnownIssueLabel),
      message: intl.formatMessage(messages.replyKnownIssueMessage),
    },
    {
      id: 'notReproducible',
      label: intl.formatMessage(messages.replyNotReproducibleLabel),
      message: intl.formatMessage(messages.replyNotReproducibleMessage),
    },
    {
      id: 'newlyAdded',
      label: intl.formatMessage(messages.replyNewlyAddedLabel),
      message: intl.formatMessage(messages.replyNewlyAddedMessage),
    },
    {
      id: 'duplicate',
      label: intl.formatMessage(messages.replyDuplicateLabel),
      message: intl.formatMessage(messages.replyDuplicateMessage),
    },
  ];

  const saveQuickReplies = async (quickReplies: QuickReplySetting[]) => {
    await axios.post('/api/v1/settings/quick-replies', {
      quickReplies,
    });

    mutate('/api/v1/settings/public');
  };

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const initialValues: QuickRepliesFormValues = {
    quickReplies: defaultQuickReplies.map((reply) => {
      const savedReply = data?.find((saved) => saved.id === reply.id);

      return {
        ...reply,
        label: savedReply?.label || reply.label,
        message: savedReply?.message || reply.message,
      };
    }),
  };

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.quickReplies),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.quickRepliesSettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.quickRepliesDescription)}
        </p>
        {isQuickRepliesRouteMissing && (
          <p className="description mt-2 text-red-300">
            {intl.formatMessage(messages.apiUnavailable)}
          </p>
        )}
      </div>
      <div className="section">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={async (values) => {
            if (isQuickRepliesRouteMissing) {
              addToast(intl.formatMessage(messages.apiUnavailable), {
                autoDismiss: true,
                appearance: 'error',
              });
              return;
            }

            try {
              await saveQuickReplies(values.quickReplies);
              addToast(intl.formatMessage(messages.toastSettingsSuccess), {
                autoDismiss: true,
                appearance: 'success',
              });
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Quick replies save error:', e);
              addToast(intl.formatMessage(messages.toastSettingsFailure), {
                autoDismiss: true,
                appearance: 'error',
              });
            } finally {
              revalidate();
            }
          }}
        >
          {({ isSubmitting, isValid, setFieldValue, values }) => (
            <Form className="section" data-testid="settings-quick-replies-form">
              {values.quickReplies.map((reply, index) => (
                <div className="mb-6" key={reply.id}>
                  <div className="form-row">
                    <label
                      htmlFor={`quickReplies.${index}.label`}
                      className="text-label"
                    >
                      {intl.formatMessage(messages.label)} #{index + 1}
                    </label>
                    <div className="form-input-area">
                      <div className="form-input-field">
                        <Field
                          id={`quickReplies.${index}.label`}
                          name={`quickReplies.${index}.label`}
                          type="text"
                        />
                        <Field
                          type="hidden"
                          name={`quickReplies.${index}.id`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <label
                      htmlFor={`quickReplies.${index}.message`}
                      className="text-label"
                    >
                      {intl.formatMessage(messages.message)} #{index + 1}
                    </label>
                    <div className="form-input-area">
                      <div className="form-input-field">
                        <Field
                          id={`quickReplies.${index}.message`}
                          name={`quickReplies.${index}.message`}
                          as="textarea"
                          className="h-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="actions">
                <Button
                  buttonType="default"
                  type="button"
                  className="mr-2"
                  onClick={() => {
                    setFieldValue('quickReplies', defaultQuickReplies);
                  }}
                >
                  {intl.formatMessage(messages.resetToDefaults)}
                </Button>
                <Button
                  buttonType="warning"
                  type="button"
                  className="mr-2"
                  disabled={isQuickRepliesRouteMissing}
                  onClick={async () => {
                    if (isQuickRepliesRouteMissing) {
                      addToast(intl.formatMessage(messages.apiUnavailable), {
                        autoDismiss: true,
                        appearance: 'error',
                      });
                      return;
                    }

                    try {
                      setFieldValue('quickReplies', defaultQuickReplies);
                      await saveQuickReplies(defaultQuickReplies);
                      addToast(
                        intl.formatMessage(messages.toastSettingsSuccess),
                        {
                          autoDismiss: true,
                          appearance: 'success',
                        }
                      );
                    } catch (e) {
                      addToast(
                        intl.formatMessage(messages.toastSettingsFailure),
                        {
                          autoDismiss: true,
                          appearance: 'error',
                        }
                      );
                    } finally {
                      revalidate();
                    }
                  }}
                >
                  {intl.formatMessage(messages.resetAndSave)}
                </Button>
                <Button
                  buttonType="primary"
                  type="submit"
                  disabled={
                    isSubmitting || !isValid || isQuickRepliesRouteMissing
                  }
                >
                  {intl.formatMessage(globalMessages.save)}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default SettingsQuickReplies;
