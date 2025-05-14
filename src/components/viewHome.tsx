import ProjectList from "./projectList";
import RosterList from "./rosterList";

function ViewHome() {

  return (
    <div className="flex flex-row gap-4">
      <div className="flex-item p-1">
        <ProjectList />
      </div>
      <div className="flex-item">
        <RosterList />
      </div>
    </div>
  );
}

export default ViewHome;