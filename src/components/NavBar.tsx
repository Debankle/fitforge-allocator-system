import { useNavigation } from "../NavServiceContext";
import "./NavBar.css"; // Import custom CSS for styling
import { NavPage } from "../interfaces";

type MenuItem = {
  label: string;
  page: NavPage;
  data: any; // Refine if you have specific types for `data`
};

function NavBar() {
  const { navigate, currentPage } = useNavigation();

  const menuItems: MenuItem[] = [
    { label: "Upload", page: "Upload", data: null },
    { label: "Configure Projects", page: "TeamsToProjects", data: null },
    { label: "Algorithm", page: "Algorithm", data: null },
    {
      label: "Spreadsheet",
      page: "Spreadsheet",
      data: { team: 1, project: 1 },
    },
    { label: "Allocations", page: "Allocations", data: null },
    { label: "Rejections", page: "Rejections", data: null },
    { label: "Project List", page: "ProjectList", data: { team: 1 } },
    { label: "Team List", page: "TeamList", data: { project: 1 } },
    {
      label: "Pairing Test",
      page: "PairingTest",
      data: { team: 1, project: 1 },
    },
  ];

  // #TODO: fix so this only swaps to valid tabs
  const listItemClass = "text-default cursor-pointer hover:text-hovered";
  const activeItemClass = "bg-blue-500 rounded-full text-white px-4 py-2"; // Circular styling

  return (
    <div className="bg-white p-4">
      <ul className="flex justify-center items-center space-x-8">
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={`${listItemClass} ${
              currentPage.page === item.page ? activeItemClass : ""
            }`}
            onClick={() => navigate({ page: item.page, data: item.data })}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NavBar;
