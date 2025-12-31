import { GlobalRole } from '../../core/constants/enums';
import { AdminHomeView } from './AdminHomeView';
import { CollectorHomeView } from './CollectorHomeView';
import { MemberHomeView } from './MemberHomeView';
import { useAuth } from '../../application/auth/auth_context';

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const currentRole = user.role;

    // ROLE-DRIVEN RENDERING: Decide which view to render based on user role
    switch (currentRole) {
        case GlobalRole.ADMIN:
            return <AdminHomeView navigation={navigation} />;
        case GlobalRole.COLLECTOR:
            return <CollectorHomeView navigation={navigation} />;
        case GlobalRole.MEMBER:
        default:
            return <MemberHomeView navigation={navigation} />;
    }
};
