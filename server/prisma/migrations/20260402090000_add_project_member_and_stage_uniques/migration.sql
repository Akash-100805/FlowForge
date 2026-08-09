-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_projectId_orderIndex_key" ON "WorkflowStage"("projectId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_projectId_name_key" ON "WorkflowStage"("projectId", "name");
