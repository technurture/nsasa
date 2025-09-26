import StaffProfileCard from '../StaffProfileCard'

export default function StaffProfileCardExample() {
  // todo: remove mock functionality
  const mockStaff = {
    id: "1",
    name: "Dr. Sarah Johnson",
    title: "Professor of Social Psychology",
    department: "Department of Social Science",
    specializations: ["Social Psychology", "Behavioral Research", "Community Studies", "Group Dynamics"],
    email: "s.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    office: "Room 305, Social Science Building",
    bio: "Dr. Johnson is a renowned expert in social psychology with over 15 years of experience in behavioral research and community studies. Her work focuses on understanding group dynamics and social influence in modern digital societies.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-prof",
    courses: [
      "Introduction to Social Psychology",
      "Research Methods in Social Science",
      "Advanced Behavioral Studies",
      "Community Psychology"
    ],
    publications: 47,
    experience: "15+ Years",
    education: [
      "Ph.D. in Social Psychology, Harvard University",
      "M.A. in Psychology, Stanford University",
      "B.A. in Social Sciences, UC Berkeley"
    ]
  };

  const handleContact = (id: string, method: 'email' | 'phone') => {
    console.log(`Contact ${id} via ${method}`);
  };

  const handleViewProfile = (id: string) => {
    console.log(`View profile for staff: ${id}`);
  };

  return (
    <div className="max-w-sm">
      <StaffProfileCard 
        staff={mockStaff}
        onContact={handleContact}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}