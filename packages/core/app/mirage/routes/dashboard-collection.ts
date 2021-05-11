import type { Server } from 'miragejs';

export default function (this: Server) {
  this.get('dashboardCollections');
  this.get('dashboardCollections/:id');
}
