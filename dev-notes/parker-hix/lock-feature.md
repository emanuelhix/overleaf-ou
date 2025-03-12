Parker Emanuel Hix

# Notes

### Developing the Project Lock Feature

I’ve been working on a project lock feature for my local Overleaf instance, and it’s been interesting. One nice thing is that the `fa-lock` and `fa-unlock` icons are already available in the project, which makes implementation a bit smoother.

#### Front-End

On the front-end side, I found a key file at `services/web/frontend/js/features/project-list/components/dropdown/actions-dropdown.tsx`. In it, the `DeleteProjectButton` is imported like this:

```tsx
import DeleteProjectButton from '../table/cells/action-buttons/delete-project-button'
```

This is where some of the logic for handling button clicks lives.

#### Back-End

Clicking the delete button triggers a call to the `deleteProject` function in `/overleaf-ou/services/web/frontend/js/features/project-list/util/api.ts`:

```tsx
export function deleteProject(projectId: string) {
  return deleteJSON(`/project/${projectId}`)
}
```

This sends a request to the API to delete a project. But where exactly does this API live, and can we modify it? Turns out, yes! The API endpoint is defined in the backend like this:

```js
app.delete('/project/:project_id', HttpController.deleteProject)
```

This is a REST API route that allows projects to be deleted by ID. 
A relevant service that uses this endpoint:
- **Document Updater Service**: `/overleaf-ou/services/document-updater/app.js`, which includes:

A lot of these services rely on `HttpController`, which does most of the heavy lifting for deleting projects. The actual `deleteProject` function looks like this:

```js
function deleteProject(req, res, next) {
  const projectId = req.params.project_id;
  logger.debug({ projectId }, 'deleting project via http');
  const options = {};
  
  if (req.query.background) options.background = true;
  if (req.query.shutdown) options.skip_history_flush = true;
  
  if (req.query.background) {
    ProjectManager.queueFlushAndDeleteProject(projectId, error => {
      if (error) return next(error);
      logger.debug({ projectId }, 'queued delete of project via http');
      res.sendStatus(204); // No Content
    });
  } else {
    const timer = new Metrics.Timer('http.deleteProject');
    ProjectManager.flushAndDeleteProjectWithLocks(projectId, options, error => {
      timer.done();
      if (error) return next(error);
      logger.debug({ projectId }, 'deleted project via http');
      res.sendStatus(204); // No Content
    });
  }
}
```


If you’re familiar with Express.js, this follows the REST api pattern.


Overall, this was a useful deep dive into how different parts of the system connect. Understanding this flow makes it easier to add new features like project locking in a way that fits cleanly into the existing architecture.

---

## Translations

I’ve centralized most of the new application’s text in `en.json` to support English translations. While it’s unlikely to be needed immediately, this setup allows OU to potentially add Spanish or other language translations in the future if desired, since they aren't hardcoded.

This text is returned from function calls like `const text = t('lock')` in `overleaf-ou/services/web/frontend/js/features/project-list/components/table/cells/action-buttons/lock-project-button.tsx`. A key from `en.json` is passed into `t`, then the value stored in `en.json` at that key is returned.


### Important Note

Translation updates do not work with hot reloading. To verify changes, stop the containers (`bin/down`) and restart them (`bin/up`). Once restarted, the page will load the updated text from `en.json` or any other configured and detected localization file.