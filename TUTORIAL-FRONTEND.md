# 🚀 Construindo o Frontend com Angular Standalone

Bem-vindo à segunda parte do nosso tutorial! Com a nossa API REST pronta, vamos agora construir uma interface de usuário (UI) moderna e reativa para interagir com ela. Criaremos um quadro Kanban funcional com a capacidade de arrastar e soltar tarefas entre as colunas.

## 🎯 Objetivo do Projeto

Nosso objetivo é criar uma Single-Page Application (SPA) que:
- Consuma a API de tarefas que construímos.
- Exiba as tarefas em um layout de colunas (A FAZER, EM ANDAMENTO, CONCLUÍDA).
- Permita que o usuário mova tarefas entre as colunas usando drag-and-drop.
- Atualize o status e a ordem das tarefas no backend automaticamente após o movimento.

### ⚙️ Tecnologias Utilizadas

- **Angular 17+**: A versão mais recente do framework, utilizando a arquitetura Standalone.
- **TypeScript**: Para um código JavaScript mais seguro e manutenível.
- **Angular CDK (Component Dev Kit)**: Para implementar a funcionalidade de drag-and-drop de forma fácil e performática.
- **SCSS**: Para uma estilização mais poderosa e organizada.

---

## 📦 Módulo 1: Configurando o Projeto Angular

Vamos começar criando nosso projeto Angular dentro da pasta `frontend`.

### 1. Pré-requisitos

- **Node.js** (versão 20 ou superior) instalado.
- **Angular CLI** instalado globalmente: `npm install -g @angular/cli`

### 2. Criando a Aplicação Angular

1.  Abra um terminal na raiz do seu projeto (`dozenflow-project/`).
2.  Navegue para a pasta `frontend` (se ela não existir, crie-a).
3.  Execute o seguinte comando para criar o projeto:

```bash
ng new dozenflow-fe --directory . --standalone --style=scss --skip-tests
```

**Analisando o comando:**
- `ng new dozenflow-fe`: Cria um novo projeto chamado `dozenflow-fe`.
- `--directory .`: Cria o projeto no diretório atual (`frontend/`) em vez de em uma nova subpasta.
- `--standalone`: Configura o projeto para usar a nova arquitetura baseada em componentes Standalone, que não requer `NgModules`.
- `--routing`: Gera um arquivo para configurar as rotas da aplicação.
- `--style=scss`: Define SCSS como o pré-processador de estilo padrão.
- `--skip-tests`: Pula a geração de arquivos de teste (`.spec.ts`) para simplificar nosso tutorial.

### 3. Estrutura de Pastas do Frontend

Após a criação, a estrutura da sua pasta `frontend` ficará assim:

```
/frontend/
├── angular.json
├── package.json
├── tsconfig.json
└── src/
    ├── app/
    │   ├── app.component.ts
    │   ├── app.component.html
    │   ├── app.component.scss
    │   ├── app.config.ts      (Configuração da aplicação)
    │   └── app.routes.ts      (Definição das rotas)
    ├── assets/
    ├── environments/
    ├── main.ts                (Ponto de entrada da aplicação)
    └── styles.scss            (Estilos globais)
```

---

## 🧩 Módulo 2: Componentes, Serviços e Modelos

Agora vamos criar os blocos de construção da nossa aplicação.

### 1. Instalando o Angular CDK

O Component Dev Kit (CDK) nos fornece a diretiva de drag-and-drop. Para instalá-lo, rode o comando no terminal, dentro da pasta `frontend/`:

```bash
ng add @angular/cdk@18
```

### ### 2. Definindo os Modelos de Dados

Vamos criar interfaces TypeScript que correspondam aos nossos DTOs do backend. Crie uma pasta `models` dentro de `src/app`.

> **Arquivo**: `frontend/src/app/models/task.model.ts`

```typescript
export enum TaskStatus {
    A_FAZER = 'A_FAZER',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    CONCLUIDA = 'CONCLUIDA'
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    taskOrder: number;
}
```

### ### 3. Criando o Serviço de Tarefas

O serviço será responsável por toda a comunicação com a nossa API backend.

1.  Crie uma pasta `services` dentro de `src/app`.
2.  Use o Angular CLI para gerar o serviço: `ng generate service services/task`

> **Arquivo**: `frontend/src/app/services/task.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }
}
```

### ### 4. Configurando o `HttpClient`

Para que nosso `TaskService` funcione, precisamos fornecer o `HttpClient` para a aplicação.

> **Arquivo**: `frontend/src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Importe aqui

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // Adicione aqui
  ]
};
```

### ### 5. Criando o Componente do Quadro Kanban

Este será o componente principal da nossa UI.

1.  Crie uma pasta `components` dentro de `src/app`.
2.  Use o CLI: `ng generate component components/kanban-board`

---

## 🎨 Módulo 3: Construindo a Interface e a Lógica

Vamos agora dar vida ao nosso quadro Kanban.

### ### 1. Implementando o Template do Kanban

> **Arquivo**: `frontend/src/app/components/kanban-board/kanban-board.component.html`

```html
<div class="kanban-board" cdkDropListGroup>
  <!-- Coluna A FAZER -->
  <div class="kanban-column">
    <h2>A Fazer</h2>
    <div
      cdkDropList
      id="todoList"
      [cdkDropListData]="todoTasks"
      class="task-list"
      (cdkDropListDropped)="drop($event)"
    >
      <div class="task-card" *ngFor="let task of todoTasks" cdkDrag>{{ task.title }}</div>
    </div>
  </div>

  <!-- Coluna EM ANDAMENTO -->
  <div class="kanban-column">
    <h2>Em Andamento</h2>
    <div
      cdkDropList
      id="inProgressList"
      [cdkDropListData]="inProgressTasks"
      class="task-list"
      (cdkDropListDropped)="drop($event)"
    >
      <div class="task-card" *ngFor="let task of inProgressTasks" cdkDrag>{{ task.title }}</div>
    </div>
  </div>

  <!-- Coluna CONCLUÍDA -->
  <div class="kanban-column">
    <h2>Concluída</h2>
    <div
      cdkDropList
      id="doneList"
      [cdkDropListData]="doneTasks"
      class="task-list"
      (cdkDropListDropped)="drop($event)"
    >
      <div class="task-card" *ngFor="let task of doneTasks" cdkDrag>{{ task.title }}</div>
    </div>
  </div>
</div>
```

### ### 2. Estilizando o Quadro

> **Arquivo**: `frontend/src/app/components/kanban-board/kanban-board.component.scss`

```scss
.kanban-board {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;
  font-family: sans-serif;
}

.kanban-column {
  flex: 1;
  background-color: #f4f5f7;
  border-radius: 8px;
  padding: 15px;
  h2 {
    text-align: center;
    color: #172b4d;
  }
}

.task-list {
  min-height: 400px;
  background-color: #ebecf0;
  border-radius: 4px;
  padding: 10px;
}

.task-card {
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(9,30,66,.25);
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

.cdk-drag-placeholder {
  opacity: 0.5;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

### ### 3. Implementando a Lógica do Componente

Esta é a parte mais importante, onde conectamos tudo.

> **Arquivo**: `frontend/src/app/components/kanban-board/kanban-board.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      // Garante que a ordem seja consistente com o backend
      const sortedTasks = tasks.sort((a, b) => a.taskOrder - b.taskOrder);

      this.todoTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.A_FAZER);
      this.inProgressTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.EM_ANDAMENTO);
      this.doneTasks = sortedTasks.filter((t: Task) => t.status === TaskStatus.CONCLUIDA);
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Move dentro da mesma lista
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfere para uma nova lista
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Atualiza o status e a ordem da tarefa movida
    const movedTask = event.container.data[event.currentIndex];
    const newStatus = this.getStatusFromContainerId(event.container.id);
    
    if (newStatus) {
      const updatedTask: Partial<Task> = { ...movedTask, status: newStatus, taskOrder: event.currentIndex };
      this.taskService.updateTask(movedTask.id, updatedTask).subscribe({
        next: () => console.log(`Task "${updatedTask.title}" updated successfully.`),
        error: (err: any) => console.error('Failed to update task', err)
      });
    }
  }

  private getStatusFromContainerId(containerId: string): TaskStatus | null {
    switch (containerId) {
      case 'todoList': return TaskStatus.A_FAZER;
      case 'inProgressList': return TaskStatus.EM_ANDAMENTO;
      case 'doneList': return TaskStatus.CONCLUIDA;
      default: return null;
    }
  }
}
```

### ### 4. Exibindo o Quadro na Página Principal

Finalmente, vamos adicionar nosso componente `kanban-board` ao `app.component`.

> **Arquivo**: `frontend/src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, KanbanBoardComponent], // Importe aqui
  template: '<app-kanban-board></app-kanban-board>', // Use o seletor aqui
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dozenflow-fe';
}
```

---

## ✅ Módulo 4: Executando a Aplicação

1.  **Inicie o Backend**: Em um terminal, navegue até a pasta `backend` e execute `mvn spring-boot:run` ou o script que criamos.
2.  **Inicie o Frontend**: Em outro terminal, navegue até a pasta `frontend` e execute `ng serve`.
3.  Abra seu navegador e acesse **http://localhost:4200**.

Você deverá ver seu quadro Kanban funcional, com as tarefas carregadas da API. Tente arrastar uma tarefa de uma coluna para outra!

Parabéns! Você construiu uma aplicação full-stack completa com um backend Spring Boot e um frontend Angular moderno.
```

---

Migração.
