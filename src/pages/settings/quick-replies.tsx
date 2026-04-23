import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsQuickReplies from '@app/components/Settings/SettingsQuickReplies';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsQuickRepliesPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);

  return (
    <SettingsLayout>
      <SettingsQuickReplies />
    </SettingsLayout>
  );
};

export default SettingsQuickRepliesPage;
