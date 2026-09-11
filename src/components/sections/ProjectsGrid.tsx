import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectScreen } from "@/components/project/ProjectScreen";
import { getPublishedProjects } from "@/lib/data/projects";

export async function ProjectsGrid() {
  const published = await getPublishedProjects();
  const featured = published.filter((p) => p.featured);
  const rest = published
    .filter((p) => !p.featured)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const ordered = [...featured, ...rest];

  return (
    <section id="progetti" className="relative">
      <div className="container-px pt-24 sm:pt-32">
        <SectionHeading title="Qualche progetto di cui vado fiero." />
      </div>

      <div className="mt-14 flex flex-col sm:mt-20">
        {ordered.map((project, i) => (
          <ProjectScreen
            key={project.id}
            project={project}
            index={i}
            total={ordered.length}
          />
        ))}
      </div>
    </section>
  );
}
