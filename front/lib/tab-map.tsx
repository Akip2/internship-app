import { UserRole } from "@/enums/user-role";
import { Tab } from "./types";
import AccountManagement from "@/components/homepage/admin/account-management";
import AttestationManagement from "@/components/homepage/secretaire/attestation-management";
import StudentManagement from "@/components/homepage/secretaire/student-management";
import AttestationDeposit from "@/components/homepage/student/attestation-deposit";

export default function getTabs(role: UserRole): Tab[] {
    switch (role) {
        case UserRole.ADMIN:
            return [
                {
                    label: "Gestion des comptes",
                    content: <AccountManagement/>
                },

                {
                    label: "Archives",
                    content: null
                }
            ]
        
        case UserRole.SECRETAIRE:
            return [
                {
                    label: "Attestations",
                    content: <AttestationManagement />
                },

                {
                    label: "Gestion des étudiants",
                    content: <StudentManagement/>
                }
            ]
        case UserRole.ETUDIANT:
            return [
                {
                label: "Mes candidatures",
                content: null
                },
            
                {
                    label: "Mon attestation",
                    content: <AttestationDeposit/>
                }
            ]
        
        default:
            return [
                {
                    label: "Placeholder",
                    content: null
                }
            ];
    }
}