from queue import Empty

class PriorityQueue:
    class _Item:
        __slots__ = '_key','_value'
        def __init__(self,k,v):
            self._key = k
            self._value = v
    def __init__(self):
        self._PQueue = list()
    def is_empty(self):
        return len(self._PQueue) == 0
    def add(self,key,value):
        new_Entry = self._Item(key,value)
    def remove_min(self):
        if self.is_empty():
            raise Empty("Priority queue is entry")
        highest = self._PQueue[0]
        highestIndex =  0
        for i in range(1,len(self._PQueue)):
            highest = self._PQueue
            highestIndex = i
        return self._PQueue.pop(highestIndex)

p = PriorityQueue()
p.add(2,"A")
