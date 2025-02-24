import { RoleState } from "../../PatientContext"

export const withRole = (roles) => (Component) => (props) => {
   const { userRole } = RoleState();

   if (userRole.match(roles)) {
      return <Component {...props} />;
   }

   return null;
}