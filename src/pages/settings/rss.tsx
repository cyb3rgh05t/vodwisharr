import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsRss from '@app/components/Settings/SettingsRss';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsRssPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsRss />
    </SettingsLayout>
  );
};

export default SettingsRssPage;
