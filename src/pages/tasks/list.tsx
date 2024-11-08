import CardTask from "@/components/tasks/kanban/CardTask";
import {
  KanbanBoard,
  KanbanBoardContainer,
} from "@/components/tasks/kanban/KanbanBoardContainer";
import KanbanColumn from "@/components/tasks/kanban/KanbanColumn";
import KanBanItem from "@/components/tasks/kanban/KanBanItem";
import { TASK_STAGES_QUERY, TASKS_QUERY } from "@/graphql/queries";
import { TaskStage } from "@/graphql/schema.types";
import { TasksQuery } from "@/graphql/types";
import { useList } from "@refinedev/core";
import {  GetFieldsFromList } from "@refinedev/nestjs-query";
import React from "react";

const TasksList = () => {
    const { data: stages, isLoading: isLoadingStages } = useList<TaskStage>({
        resource: "taskStages",
        filters: [
          {
            field: "title",
            operator: "in",
            value: ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"],
          },
        ],
        sorters: [
          {
            field: "createdAt",
            order: "asc",
          },
        ],
        meta: {
          gqlQuery: TASK_STAGES_QUERY,
        },
      });
    
      const { data: tasks, isLoading: isLoadingTasks } = useList<
        GetFieldsFromList<TasksQuery>
      >({
        resource: "tasks",
        sorters: [
          {
            field: "dueDate",
            order: "asc",
          },
        ],
        queryOptions: {
          enabled: !!stages,
        },
        pagination: {
          mode: "off",
        },
        meta: {
          gqlQuery: TASKS_QUERY,
        },
      });

  const taskStages = React.useMemo(() => {
    if (!tasks?.data || !stages?.data)
      return {
        unassignedStage: [],
        stages: [],
      };


    const unassignedStage = tasks.data.filter((task) => task.stageId === null);

    const grouped: TaskStage[] = stages.data.map((stage) => ({
        ...stage,
        tasks: tasks.data.filter((task) => task.stageId?.toString() === stage.id),
      }));

    return {
      unassignedStage,
      columns: grouped,
    };
  }, [stages, tasks]);

  const handleAddCard = (args:{stageId:string}) =>{

  }

  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard>
          <KanbanColumn
            id="unassigned"
            title={"unassigned"}
            count={taskStages.unassignedStage.length || 0}
            onAddClick={()=>handleAddCard({stageId:'unassigned'})}
          >
            {taskStages.unassignedStage.map((task) =>(
                <KanBanItem
                    key={task.id}
                    id={task.id}
                    data={{...task, stageId: 'unnasigned'}}
                >
                    <CardTask 
                        {...task}
                        dueDate={task.dueDate || undefined}
                    />
                </KanBanItem>
            ))}
          </KanbanColumn>
          
        </KanbanBoard>
      </KanbanBoardContainer>
    </>
  );
};

export default TasksList;
